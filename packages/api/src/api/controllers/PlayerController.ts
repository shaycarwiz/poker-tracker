import {
  Controller,
  Get,
  Post,
  Put,
  Route,
  Body,
  Path,
  Query,
  Request,
  Tags,
  Example,
  Security,
} from "tsoa";
import { injectable, inject } from "tsyringe";
import { PlayerService } from "@/application/services/player-service";
import { logger } from "@/shared/utils/logger";
import { config } from "@/infrastructure/config";
import { AuthenticatedRequest } from "@/api/middleware/auth";
import {
  createErrorResponse,
  createSuccessResponse,
  handleUnknownError,
  DomainError,
  API_ERROR_CODES,
  APIErrorCode,
} from "@/shared";
import {
  CreatePlayerResponse,
  GetPlayerResponse,
  UpdatePlayerResponse,
  ListPlayersResponse,
  AddBankrollResponse,
  ApiResponse,
  PlayerStatsResponse,
} from "../types";

@Route("players")
@Tags("Players")
@injectable()
export class PlayerController extends Controller {
  constructor(@inject("PlayerService") private playerService: PlayerService) {
    super();
  }

  private handleError(
    error: unknown,
    fallbackCode: APIErrorCode
  ): ApiResponse<any> {
    if (error instanceof DomainError) {
      this.setStatus(error.statusCode);
      return createErrorResponse(error.code, error.statusCode);
    }

    const errorResponse = handleUnknownError(error, fallbackCode);
    this.setStatus(errorResponse.statusCode);
    return errorResponse;
  }

  @Post("/")
  @Security("jwt")
  @Example<{ name: string; email?: string; initialBankroll?: { amount: number; currency: string } }>({
    name: "John Doe",
    email: "john@example.com",
    initialBankroll: { amount: 1000, currency: "USD" },
  })
  public async createPlayer(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      name: string;
      email?: string;
      initialBankroll?: { amount: number; currency: string };
    }
  ): Promise<ApiResponse<CreatePlayerResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      if (!body.name || typeof body.name !== "string") {
        this.setStatus(400);
        return createErrorResponse(
          API_ERROR_CODES.VALIDATION_NAME_REQUIRED,
          400
        );
      }

      const response = await this.playerService.createPlayer({
        ownerUserId: req.user.userId,
        name: body.name,
        email: body.email,
        initialBankroll: body.initialBankroll
          ? {
              amount: body.initialBankroll.amount,
              currency:
                body.initialBankroll.currency || config.poker.defaultCurrency,
            }
          : { amount: 0, currency: config.poker.defaultCurrency },
      });

      this.setStatus(201);
      return createSuccessResponse(response);
    } catch (error) {
      logger.error("Error creating player", { error, body });
      return this.handleError(error, API_ERROR_CODES.API_CREATE_PLAYER_FAILED);
    }
  }

  @Get("/me")
  @Security("jwt")
  public async getCurrentPlayer(
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponse<GetPlayerResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const player = await this.playerService.getDefaultPlayer(
        req.user.userId
      );
      return { success: true, data: player };
    } catch (error) {
      logger.error("Error getting current player", { error });
      this.setStatus(404);
      return { success: false, error: "Player profile not found" };
    }
  }

  @Get("/me/stats")
  @Security("jwt")
  public async getCurrentPlayerStats(
    @Request() req: AuthenticatedRequest
  ): Promise<ApiResponse<PlayerStatsResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const player = await this.playerService.getDefaultPlayer(
        req.user.userId
      );

      return {
        success: true,
        data: {
          playerId: player.id,
          totalSessions: player.totalSessions,
          totalWinnings: player.totalWinnings.amount,
          winRate: player.winRate,
          averageSession: 0,
        },
      };
    } catch (error) {
      logger.error("Error getting current player stats", { error });
      this.setStatus(500);
      return { success: false, error: "Failed to get player stats" };
    }
  }

  @Get("/")
  @Security("jwt")
  public async listPlayers(
    @Request() req: AuthenticatedRequest,
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<ApiResponse<ListPlayersResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.playerService.listPlayersByOwner(
        req.user.userId,
        page,
        limit
      );
      return { success: true, data: response };
    } catch (error) {
      logger.error("Error listing players", { error });
      this.setStatus(500);
      return { success: false, error: "Failed to list players" };
    }
  }

  @Get("/{id}")
  @Security("jwt")
  public async getPlayer(
    @Request() req: AuthenticatedRequest,
    @Path() id: string
  ): Promise<ApiResponse<GetPlayerResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const player = await this.playerService.getPlayer(id, req.user.userId);
      return { success: true, data: player };
    } catch (error) {
      logger.error("Error getting player", { error, id });
      this.setStatus(404);
      return { success: false, error: "Player not found" };
    }
  }

  @Put("/{id}")
  @Security("jwt")
  public async updatePlayer(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: { name?: string; email?: string }
  ): Promise<ApiResponse<UpdatePlayerResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.playerService.updatePlayer({
        id,
        ownerUserId: req.user.userId,
        name: body.name,
        email: body.email,
      });
      return createSuccessResponse(response);
    } catch (error) {
      logger.error("Error updating player", { error, id, body });
      return this.handleError(error, API_ERROR_CODES.API_UPDATE_PLAYER_FAILED);
    }
  }

  @Put("/{id}/bankroll")
  @Security("jwt")
  public async updatePlayerBankroll(
    @Request() req: AuthenticatedRequest,
    @Path() id: string,
    @Body() body: { amount: number; currency?: string }
  ): Promise<ApiResponse<AddBankrollResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const response = await this.playerService.addToBankroll({
        playerId: id,
        ownerUserId: req.user.userId,
        amount: {
          amount: body.amount,
          currency: body.currency || config.poker.defaultCurrency,
        },
      });
      return createSuccessResponse(response);
    } catch (error) {
      logger.error("Error updating player bankroll", { error, id, body });
      return this.handleError(error, API_ERROR_CODES.API_UPDATE_PLAYER_FAILED);
    }
  }

  @Put("/me/bankroll")
  @Security("jwt")
  public async updateCurrentPlayerBankroll(
    @Request() req: AuthenticatedRequest,
    @Body() body: { amount: number; currency?: string }
  ): Promise<ApiResponse<AddBankrollResponse>> {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const defaultPlayer = await this.playerService.getDefaultPlayer(
        req.user.userId
      );

      const response = await this.playerService.addToBankroll({
        playerId: defaultPlayer.id,
        ownerUserId: req.user.userId,
        amount: {
          amount: body.amount,
          currency: body.currency || config.poker.defaultCurrency,
        },
      });
      return createSuccessResponse(response);
    } catch (error) {
      logger.error("Error updating current player bankroll", { error, body });
      return this.handleError(error, API_ERROR_CODES.API_UPDATE_PLAYER_FAILED);
    }
  }
}
