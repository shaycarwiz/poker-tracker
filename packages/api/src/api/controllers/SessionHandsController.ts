import {
  Controller,
  Get,
  Post,
  Route,
  Body,
  Path,
  Tags,
  Security,
  Request,
} from "tsoa";
import { injectable, inject } from "tsyringe";
import { HandService } from "@/application/services/hand-service";
import { logger } from "@/shared/utils/logger";
import { AuthenticatedRequest } from "@/api/middleware/auth";
import {
  ApiResponse,
  CreateHandResponse,
  HandStateInput,
  ListHandsResponse,
} from "../types";
import { ZodError } from "zod";

@Route("sessions/{sessionId}/hands")
@Tags("Hands")
@Security("jwt")
@injectable()
export class SessionHandsController extends Controller {
  constructor(@inject("HandService") private handService: HandService) {
    super();
  }

  @Post("/")
  public async createHand(
    @Request() req: AuthenticatedRequest,
    @Path() sessionId: string,
    @Body()
    body: {
      captureType: "snapshot" | "full";
      handState: HandStateInput;
      heroPlayerId?: string;
      tags?: string[];
      note?: string;
    }
  ): Promise<ApiResponse<CreateHandResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.handService.createHand({
        sessionId,
        userId: req.user.userId,
        captureType: body.captureType,
        handState: body.handState as import("@/model/hand-state").HandStateV1,
        heroPlayerId: body.heroPlayerId,
        tags: body.tags,
        note: body.note,
      });

      this.setStatus(201);
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error creating hand", { error, sessionId, body });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return { success: false, error: "Session not found" };
      }
      if (
        error instanceof Error &&
        error.message === "Cannot add hands to this session"
      ) {
        this.setStatus(400);
        return { success: false, error: error.message };
      }
      if (error instanceof ZodError) {
        this.setStatus(400);
        return { success: false, error: "Invalid hand state" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to create hand",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/")
  public async listHands(
    @Request() req: AuthenticatedRequest,
    @Path() sessionId: string
  ): Promise<ApiResponse<ListHandsResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.handService.listHandsBySession(
        sessionId,
        req.user.userId
      );
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error listing hands", { error, sessionId });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return { success: false, error: "Session not found" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to list hands",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
