import {
  Controller,
  Delete,
  Get,
  Patch,
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
  HandResponse,
  HandStateInput,
  UpdateHandResponse,
} from "../types";
import { ZodError } from "zod";

@Route("hands")
@Tags("Hands")
@Security("jwt")
@injectable()
export class HandController extends Controller {
  constructor(@inject("HandService") private handService: HandService) {
    super();
  }

  @Get("/{handId}")
  public async getHand(
    @Request() req: AuthenticatedRequest,
    @Path() handId: string
  ): Promise<ApiResponse<HandResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.handService.getHand(
        handId,
        req.user.userId
      );
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error getting hand", { error, handId });
      if (error instanceof Error && error.message === "Hand not found") {
        this.setStatus(404);
        return { success: false, error: "Hand not found" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get hand",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Patch("/{handId}")
  public async updateHand(
    @Request() req: AuthenticatedRequest,
    @Path() handId: string,
    @Body()
    body: {
      handState: HandStateInput;
      heroPlayerId?: string;
      tags?: string[];
      note?: string;
    }
  ): Promise<ApiResponse<UpdateHandResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.handService.updateHand({
        handId,
        userId: req.user.userId,
        handState: body.handState as import("@/model/hand-state").HandStateV1,
        heroPlayerId: body.heroPlayerId,
        tags: body.tags,
        note: body.note,
      });

      return { success: true, data: response };
    } catch (error) {
      logger.error("Error updating hand", { error, handId, body });
      if (error instanceof Error && error.message === "Hand not found") {
        this.setStatus(404);
        return { success: false, error: "Hand not found" };
      }
      if (error instanceof ZodError) {
        this.setStatus(400);
        return { success: false, error: "Invalid hand state" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to update hand",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Delete("/{handId}")
  public async deleteHand(
    @Request() req: AuthenticatedRequest,
    @Path() handId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      await this.handService.deleteHand(handId, req.user.userId);
      return { success: true, data: { deleted: true } };
    } catch (error) {
      logger.error("Error deleting hand", { error, handId });
      if (error instanceof Error && error.message === "Hand not found") {
        this.setStatus(404);
        return { success: false, error: "Hand not found" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to delete hand",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
