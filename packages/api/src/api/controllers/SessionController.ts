import {
  Controller,
  Get,
  Post,
  Patch,
  Route,
  Body,
  Path,
  Query,
  Tags,
  Example,
  Security,
  Request,
} from "tsoa";
import { injectable, inject } from "tsyringe";
import { SessionService } from "@/application/services/session-service";
import { UserService } from "@/application/services/user-service";
import { logger } from "@/shared/utils/logger";
import { config } from "@/infrastructure/config";
import { AuthenticatedRequest } from "@/api/middleware/auth";
import {
  StartSessionRequest,
  EndSessionRequest,
  AddTransactionRequest,
  UpdateSessionNotesRequest,
  ListSessionsRequest,
  StartSessionResponse,
  EndSessionResponse,
  AddTransactionResponse,
  GetSessionResponse,
  ListSessionsResponse,
  UpdateSessionNotesResponse,
  CancelSessionResponse,
  ApiResponse,
} from "../types";

@Route("sessions")
@Tags("Sessions")
@Security("jwt")
@injectable()
export class SessionController extends Controller {
  constructor(
    @inject("SessionService") private sessionService: SessionService,
    @inject("UserService") private userService: UserService
  ) {
    super();
  }

  @Post("/")
  @Example<{
    location: string;
    stakes: { smallBlind: number; bigBlind: number; currency: string };
    initialBuyIn: { amount: number; currency: string };
    initialBuyInPlayerId?: string;
    notes?: string;
  }>({
    location: "Casino Royale",
    stakes: { smallBlind: 1, bigBlind: 2, currency: "USD" },
    initialBuyIn: { amount: 200, currency: "USD" },
    notes: "Starting a new session",
  })
  public async startSession(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      location: string;
      stakes: { smallBlind: number; bigBlind: number; currency?: string };
      initialBuyIn: { amount: number; currency?: string };
      initialBuyInPlayerId?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<StartSessionResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const { location, stakes, initialBuyIn, initialBuyInPlayerId, notes } =
        body;

      if (!location || typeof location !== "string") {
        this.setStatus(400);
        return { success: false, error: "Location is required" };
      }

      if (!stakes?.smallBlind || !stakes?.bigBlind) {
        this.setStatus(400);
        return { success: false, error: "Stakes are required" };
      }

      if (!initialBuyIn || typeof initialBuyIn.amount !== "number") {
        this.setStatus(400);
        return { success: false, error: "Initial buy-in is required" };
      }

      const request: StartSessionRequest = {
        userId: req.user.userId,
        initialBuyInPlayerId: initialBuyInPlayerId,
        location,
        stakes: {
          smallBlind: stakes.smallBlind,
          bigBlind: stakes.bigBlind,
          currency: stakes.currency || config.poker.defaultCurrency,
        },
        initialBuyIn: {
          amount: initialBuyIn.amount,
          currency: initialBuyIn.currency || config.poker.defaultCurrency,
        },
        notes,
      };

      const response = await this.sessionService.startSession(request);
      this.setStatus(201);
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error starting session", { error, body });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to start session",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Post("/{id}/end")
  public async endSession(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body()
    body: {
      playerId?: string;
      finalCashOut: { amount: number; currency?: string };
      notes?: string;
    }
  ): Promise<ApiResponse<EndSessionResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const profile = await this.userService.getProfile(req.user.userId);
      const playerId = body.playerId || profile.defaultPlayerId;

      if (!playerId) {
        this.setStatus(400);
        return { success: false, error: "Player ID is required" };
      }

      const request: EndSessionRequest = {
        sessionId: id,
        userId: req.user.userId,
        playerId,
        finalCashOut: {
          amount: body.finalCashOut.amount,
          currency:
            body.finalCashOut.currency || config.poker.defaultCurrency,
        },
        notes: body.notes,
      };

      const response = await this.sessionService.endSession(request);
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error ending session", { error, id, body });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return { success: false, error: "Session not found" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to end session",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Post("/{id}/transactions")
  public async addTransaction(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body()
    body: {
      playerId: string;
      type: string;
      amount: { amount: number; currency?: string };
      notes?: string;
    }
  ): Promise<ApiResponse<AddTransactionResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      if (!body.playerId) {
        this.setStatus(400);
        return { success: false, error: "Player ID is required" };
      }

      const request: AddTransactionRequest = {
        sessionId: id,
        userId: req.user.userId,
        playerId: body.playerId,
        type: body.type,
        amount: {
          amount: body.amount.amount,
          currency: body.amount.currency || config.poker.defaultCurrency,
        },
        description: body.notes,
      };

      const response = await this.sessionService.addTransaction(request);
      this.setStatus(201);
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error adding transaction", { error, id, body });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return { success: false, error: "Session not found" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to add transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/{id}")
  public async getSession(
    @Request() req: AuthenticatedRequest,
    @Path() id: string
  ): Promise<ApiResponse<GetSessionResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.sessionService.getSession(
        id,
        req.user.userId
      );
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error getting session", { error, id });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return { success: false, error: "Session not found" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get session",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/")
  public async listSessions(
    @Request() req: AuthenticatedRequest,
    @Query() status?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() startDate?: string,
    @Query() endDate?: string
  ): Promise<ApiResponse<ListSessionsResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const request: ListSessionsRequest = {
        userId: req.user.userId,
        status,
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const response = await this.sessionService.listSessions(request);
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error listing sessions", { error });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to list sessions",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/me/active")
  public async getActiveSession(
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponse<GetSessionResponse | null>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.sessionService.getActiveSession(
        req.user.userId
      );
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error getting active session", { error });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get active session",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Post("/{id}/cancel")
  public async cancelSession(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: { reason?: string; playerId?: string } = {}
  ): Promise<ApiResponse<CancelSessionResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const profile = await this.userService.getProfile(req.user.userId);
      const playerId = body.playerId || profile.defaultPlayerId;

      if (!playerId) {
        this.setStatus(400);
        return { success: false, error: "Player ID is required" };
      }

      const request: EndSessionRequest = {
        sessionId: id,
        userId: req.user.userId,
        playerId,
        finalCashOut: { amount: 0, currency: config.poker.defaultCurrency },
        notes: body.reason || "Session cancelled",
      };

      const response = await this.sessionService.endSession(request);
      return { success: true, data: response as CancelSessionResponse };
    } catch (error) {
      logger.error("Error cancelling session", { error, id });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to cancel session",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Patch("/{id}/notes")
  public async updateSessionNotes(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: { notes: string }
  ): Promise<ApiResponse<UpdateSessionNotesResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const request: UpdateSessionNotesRequest = {
        sessionId: id,
        userId: req.user.userId,
        notes: body.notes,
      };

      const response = await this.sessionService.updateSessionNotes(request);
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error updating session notes", { error, id, body });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return { success: false, error: "Session not found" };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to update session notes",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
