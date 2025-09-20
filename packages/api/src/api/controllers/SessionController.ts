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
} from "tsoa";
import { injectable } from "tsyringe";
import { container } from "@/infrastructure/container";
import { logger } from "@/shared/utils/logger";
import { config } from "@/infrastructure/config";
import {
  // Request DTOs
  StartSessionRequest,
  EndSessionRequest,
  AddTransactionRequest,
  UpdateSessionNotesRequest,
  ListSessionsRequest,
  // Response DTOs
  StartSessionResponse,
  EndSessionResponse,
  AddTransactionResponse,
  GetSessionResponse,
  ListSessionsResponse,
  UpdateSessionNotesResponse,
  CancelSessionResponse,
  // Common types
  ApiResponse,
} from "../types";

@Route("sessions")
@Tags("Sessions")
@injectable()
export class SessionController extends Controller {
  private sessionService = container.services.sessions;

  @Post("/")
  @Example<StartSessionRequest>({
    playerId: "player-123",
    location: "Casino Royale",
    stakes: {
      smallBlind: 1,
      bigBlind: 2,
      currency: "USD",
    },
    initialBuyIn: {
      amount: 200,
      currency: "USD",
    },
    notes: "Starting a new session",
  })
  public async startSession(
    @Body() body: StartSessionRequest
  ): Promise<ApiResponse<StartSessionResponse>> {
    try {
      const { playerId, location, stakes, initialBuyIn, notes } = body;

      if (!playerId || typeof playerId !== "string") {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required and must be a string",
        };
      }

      if (!location || typeof location !== "string") {
        this.setStatus(400);
        return {
          success: false,
          error: "Location is required and must be a string",
        };
      }

      if (!stakes || !stakes.smallBlind || !stakes.bigBlind) {
        this.setStatus(400);
        return {
          success: false,
          error: "Stakes with smallBlind and bigBlind are required",
        };
      }

      if (!initialBuyIn || typeof initialBuyIn.amount !== "number") {
        this.setStatus(400);
        return {
          success: false,
          error: "Initial buy-in amount is required and must be a number",
        };
      }

      const request: StartSessionRequest = {
        playerId,
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
      return {
        success: true,
        data: response,
      };
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
  @Example<{
    finalCashOut: { amount: number; currency?: string };
    notes?: string;
  }>({
    finalCashOut: {
      amount: 250,
      currency: "USD",
    },
    notes: "Session ended with profit",
  })
  public async endSession(
    @Path() id: string,
    @Body()
    body: {
      finalCashOut: { amount: number; currency?: string };
      notes?: string;
    }
  ): Promise<ApiResponse<EndSessionResponse>> {
    try {
      const { finalCashOut, notes } = body;

      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Session ID is required",
        };
      }

      if (!finalCashOut || typeof finalCashOut.amount !== "number") {
        this.setStatus(400);
        return {
          success: false,
          error: "Final cash out amount is required and must be a number",
        };
      }

      const request: EndSessionRequest = {
        sessionId: id,
        finalCashOut: {
          amount: finalCashOut.amount,
          currency: finalCashOut.currency || config.poker.defaultCurrency,
        },
        notes,
      };

      const response = await this.sessionService.endSession(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error ending session", {
        error,
        id,
        body,
      });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Session not found",
        };
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
  @Example<{
    type: string;
    amount: { amount: number; currency?: string };
    notes?: string;
  }>({
    type: "buy-in",
    amount: {
      amount: 50,
      currency: "USD",
    },
    notes: "Additional buy-in",
  })
  public async addTransaction(
    @Path() id: string,
    @Body()
    body: {
      type: string;
      amount: { amount: number; currency?: string };
      notes?: string;
    }
  ): Promise<ApiResponse<AddTransactionResponse>> {
    try {
      const { type, amount, notes } = body;

      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Session ID is required",
        };
      }

      if (!type || typeof type !== "string") {
        this.setStatus(400);
        return {
          success: false,
          error: "Transaction type is required and must be a string",
        };
      }

      if (!amount || typeof amount.amount !== "number") {
        this.setStatus(400);
        return {
          success: false,
          error: "Amount is required and must be a number",
        };
      }

      const request: AddTransactionRequest = {
        sessionId: id,
        type,
        amount: {
          amount: amount.amount,
          currency: amount.currency || config.poker.defaultCurrency,
        },
        description: notes,
      };

      const response = await this.sessionService.addTransaction(request);

      this.setStatus(201);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error adding transaction", {
        error,
        id,
        body,
      });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Session not found",
        };
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
    @Path() id: string
  ): Promise<ApiResponse<GetSessionResponse>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Session ID is required",
        };
      }

      const response = await this.sessionService.getSession(id);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error getting session", { error, id });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Session not found",
        };
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
    @Query() playerId?: string,
    @Query() status?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() startDate?: string,
    @Query() endDate?: string
  ): Promise<ApiResponse<ListSessionsResponse>> {
    try {
      const request: ListSessionsRequest = {
        playerId,
        status,
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      const response = await this.sessionService.listSessions(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error listing sessions", {
        error,
        playerId,
        status,
        page,
        limit,
        startDate,
        endDate,
      });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to list sessions",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Post("/{id}/cancel")
  @Example<{ reason?: string }>({
    reason: "Emergency - had to leave",
  })
  public async cancelSession(
    @Path() id: string,
    @Body() body: { reason?: string } = {}
  ): Promise<ApiResponse<CancelSessionResponse>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Session ID is required",
        };
      }

      const request: EndSessionRequest = {
        sessionId: id,
        finalCashOut: { amount: 0, currency: config.poker.defaultCurrency },
        notes: body.reason || "Session cancelled",
      };

      const response = await this.sessionService.endSession(request);

      return {
        success: true,
        data: response as CancelSessionResponse,
      };
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
  @Example<{ notes: string }>({
    notes: "Updated session notes with important observations",
  })
  public async updateSessionNotes(
    @Path() id: string,
    @Body() body: { notes: string }
  ): Promise<ApiResponse<UpdateSessionNotesResponse>> {
    try {
      const { notes } = body;

      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Session ID is required",
        };
      }

      if (!notes || typeof notes !== "string") {
        this.setStatus(400);
        return {
          success: false,
          error: "Notes are required and must be a string",
        };
      }

      const request: UpdateSessionNotesRequest = {
        sessionId: id,
        notes,
      };

      const response = await this.sessionService.updateSessionNotes(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error updating session notes", {
        error,
        id,
        body,
      });
      if (error instanceof Error && error.message === "Session not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Session not found",
        };
      }
      if (error instanceof Error && error.message === "Session is not active") {
        this.setStatus(400);
        return {
          success: false,
          error: "Session is not active",
        };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to update session notes",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/player/{playerId}")
  public async getPlayerSessions(
    @Path() playerId: string
  ): Promise<ApiResponse<ListSessionsResponse>> {
    try {
      if (!playerId) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      const request: ListSessionsRequest = {
        playerId,
        page: 1,
        limit: 100,
      };

      const response = await this.sessionService.listSessions(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error getting player sessions", {
        error,
        playerId,
      });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get player sessions",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/player/{playerId}/active")
  public async getActiveSession(
    @Path() playerId: string
  ): Promise<ApiResponse<GetSessionResponse | null>> {
    try {
      if (!playerId) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      const request: ListSessionsRequest = {
        playerId,
        status: "active",
        page: 1,
        limit: 1,
      };

      const response = await this.sessionService.listSessions(request);

      return {
        success: true,
        data: response.sessions[0] || null,
      };
    } catch (error) {
      logger.error("Error getting active session", {
        error,
        playerId,
      });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get active session",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
