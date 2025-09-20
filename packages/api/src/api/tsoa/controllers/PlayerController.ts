import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Body,
  Path,
  Query,
  Request,
  Tags,
  Example,
  Security,
} from "tsoa";
import { injectable } from "tsyringe";
import { container } from "@/infrastructure/container";
import { logger } from "@/shared/utils/logger";
import { config } from "@/infrastructure/config";
import { AuthenticatedRequest } from "@/api/middleware/auth";
// Response models for TSOA
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// TSOA Request DTOs
export interface CreatePlayerRequest {
  name: string;
  email?: string;
  initialBankroll?: {
    amount: number;
    currency: string;
  };
}

export interface UpdatePlayerRequest {
  id: string;
  name?: string;
  email?: string;
}

export interface AddBankrollRequest {
  playerId: string;
  amount: {
    amount: number;
    currency: string;
  };
  reason?: string;
}

// TSOA Response DTOs
export interface CreatePlayerResponse {
  id: string;
  name: string;
  email?: string | undefined;
  bankroll: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
}

export interface GetPlayerResponse {
  id: string;
  name: string;
  email?: string | undefined;
  bankroll: {
    amount: number;
    currency: string;
  };
  totalSessions: number;
  totalWinnings: {
    amount: number;
    currency: string;
  };
  winRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePlayerResponse {
  id: string;
  name: string;
  email?: string | undefined;
  bankroll: {
    amount: number;
    currency: string;
  };
  updatedAt: Date;
}

export interface ListPlayersResponse {
  players: GetPlayerResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface AddBankrollResponse {
  playerId: string;
  newBankroll: {
    amount: number;
    currency: string;
  };
  addedAmount: {
    amount: number;
    currency: string;
  };
  addedAt: Date;
}

export interface PlayerStatsResponse {
  playerId: string;
  totalSessions: number;
  totalWinnings: number;
  winRate: number;
  averageSession: number;
}

export interface SearchPlayersResponse {
  players: GetPlayerResponse[];
  total: number;
  page: number;
  limit: number;
}

@Route("players")
@Tags("Players")
@injectable()
export class PlayerController extends Controller {
  private playerService = container.services.players;

  @Post("/")
  @Example<CreatePlayerRequest>({
    name: "John Doe",
    email: "john@example.com",
    initialBankroll: {
      amount: 1000,
      currency: "USD",
    },
  })
  public async createPlayer(
    @Body() body: CreatePlayerRequest
  ): Promise<ApiResponse<CreatePlayerResponse>> {
    try {
      const { name, email, initialBankroll } = body;

      if (!name || typeof name !== "string") {
        this.setStatus(400);
        return {
          success: false,
          error: "Name is required and must be a string",
        };
      }

      const request: CreatePlayerRequest = {
        name,
        email,
        initialBankroll: initialBankroll
          ? {
              amount: initialBankroll.amount,
              currency:
                initialBankroll.currency || config.poker.defaultCurrency,
            }
          : {
              amount: 0,
              currency: config.poker.defaultCurrency,
            },
      };

      const response = await this.playerService.createPlayer(request);
      this.setStatus(201);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error creating player", { error, body });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to create player",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/{id}")
  public async getPlayer(
    @Path() id: string
  ): Promise<ApiResponse<GetPlayerResponse>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      const response = await this.playerService.getPlayer(id);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error getting player", { error, id });
      if (error instanceof Error && error.message === "Player not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Player not found",
        };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get player",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/")
  public async getAllPlayers(
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<ApiResponse<ListPlayersResponse>> {
    try {
      const response = await this.playerService.getAllPlayers(page, limit);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error getting all players", { error });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get players",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Put("/{id}")
  public async updatePlayer(
    @Path() id: string,
    @Body() body: Omit<UpdatePlayerRequest, "id">
  ): Promise<ApiResponse<UpdatePlayerResponse>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      const { name, email } = body;
      const request: UpdatePlayerRequest = {
        id,
        name,
        email,
      };

      const response = await this.playerService.updatePlayer(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error updating player", {
        error,
        id,
        body,
      });
      if (error instanceof Error && error.message === "Player not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Player not found",
        };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to update player",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Post("/{id}/bankroll")
  @Example<{ amount: number; currency?: string; reason?: string }>({
    amount: 500,
    currency: "USD",
    reason: "Tournament winnings",
  })
  public async addToBankroll(
    @Path() id: string,
    @Body() body: { amount: number; currency?: string; reason?: string }
  ): Promise<ApiResponse<AddBankrollResponse>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      const { amount, currency, reason } = body;

      if (!amount || typeof amount !== "number") {
        this.setStatus(400);
        return {
          success: false,
          error: "Amount is required and must be a number",
        };
      }

      const request: AddBankrollRequest = {
        playerId: id,
        amount: {
          amount,
          currency: currency || config.poker.defaultCurrency,
        },
        reason,
      };

      const response = await this.playerService.addToBankroll(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error adding to bankroll", {
        error,
        id,
        body,
      });
      if (error instanceof Error && error.message === "Player not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Player not found",
        };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to add to bankroll",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/search")
  public async searchPlayers(
    @Query() q: string
  ): Promise<ApiResponse<SearchPlayersResponse>> {
    try {
      if (!q || typeof q !== "string") {
        this.setStatus(400);
        return {
          success: false,
          error: "Search query is required",
        };
      }

      // For now, return empty results - implement search logic later
      return {
        success: true,
        data: {
          players: [],
          total: 0,
          page: 1,
          limit: 10,
        },
      };
    } catch (error) {
      logger.error("Error searching players", { error, query: q });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to search players",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/{id}/stats")
  public async getPlayerStats(
    @Path() id: string
  ): Promise<ApiResponse<PlayerStatsResponse>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      // For now, return basic stats - implement stats logic later
      return {
        success: true,
        data: {
          playerId: id,
          totalSessions: 0,
          totalWinnings: 0,
          winRate: 0,
          averageSession: 0,
        },
      };
    } catch (error) {
      logger.error("Error getting player stats", { error, id });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get player stats",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Put("/{id}/bankroll")
  @Example<{ amount: number; currency?: string }>({
    amount: 1000,
    currency: "USD",
  })
  public async updatePlayerBankroll(
    @Path() id: string,
    @Body() body: { amount: number; currency?: string }
  ): Promise<ApiResponse<AddBankrollResponse>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      const { amount, currency } = body;

      if (!amount || typeof amount !== "number") {
        this.setStatus(400);
        return {
          success: false,
          error: "Amount is required and must be a number",
        };
      }

      const request: AddBankrollRequest = {
        playerId: id,
        amount: {
          amount,
          currency: currency || config.poker.defaultCurrency,
        },
        reason: "Manual bankroll update",
      };

      const response = await this.playerService.addToBankroll(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error updating player bankroll", {
        error,
        id,
        body,
      });
      if (error instanceof Error && error.message === "Player not found") {
        this.setStatus(404);
        return {
          success: false,
          error: "Player not found",
        };
      }
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to update player bankroll",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Delete("/{id}")
  public async deletePlayer(
    @Path() id: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!id) {
        this.setStatus(400);
        return {
          success: false,
          error: "Player ID is required",
        };
      }

      // For now, return success - implement delete logic later
      return {
        success: true,
        data: {
          message: "Player deleted successfully",
        },
      };
    } catch (error) {
      logger.error("Error deleting player", { error, id });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to delete player",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/me")
  @Security("jwt")
  public async getCurrentPlayer(
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponse<GetPlayerResponse>> {
    try {
      if (!req.player) {
        this.setStatus(404);
        return {
          success: false,
          error: "Player profile not found",
        };
      }

      return {
        success: true,
        data: req.player,
      };
    } catch (error) {
      logger.error("Error getting current player", {
        error,
        userId: req.user?.googleId,
      });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get player profile",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Get("/me/stats")
  @Security("jwt")
  public async getCurrentPlayerStats(
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponse<PlayerStatsResponse>> {
    try {
      if (!req.player) {
        this.setStatus(404);
        return {
          success: false,
          error: "Player profile not found",
        };
      }

      // For now, return basic stats - implement stats logic later
      return {
        success: true,
        data: {
          playerId: req.player.id,
          totalSessions: 0,
          totalWinnings: 0,
          winRate: 0,
          averageSession: 0,
        },
      };
    } catch (error) {
      logger.error("Error getting current player stats", {
        error,
        userId: req.user?.googleId,
      });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to get player stats",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  @Put("/me/bankroll")
  @Security("jwt")
  @Example<{ amount: number; currency?: string }>({
    amount: 500,
    currency: "USD",
  })
  public async updateCurrentPlayerBankroll(
    @Request() req: AuthenticatedRequest,
    @Body() body: { amount: number; currency?: string }
  ): Promise<ApiResponse<AddBankrollResponse>> {
    try {
      if (!req.player) {
        this.setStatus(404);
        return {
          success: false,
          error: "Player profile not found",
        };
      }

      const { amount, currency } = body;

      if (!amount || typeof amount !== "number") {
        this.setStatus(400);
        return {
          success: false,
          error: "Amount is required and must be a number",
        };
      }

      const request: AddBankrollRequest = {
        playerId: req.player.id,
        amount: {
          amount,
          currency: currency || config.poker.defaultCurrency,
        },
        reason: "Manual bankroll update",
      };

      const response = await this.playerService.addToBankroll(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error updating current player bankroll", {
        error,
        userId: req.user?.googleId,
        body,
      });
      this.setStatus(500);
      return {
        success: false,
        error: "Failed to update bankroll",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
