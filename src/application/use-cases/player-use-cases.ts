// Player use cases - Business logic for player operations

import { Player, PlayerId } from "@/model/entities";
import { PlayerStatsService } from "@/model/domain-services";
import { Money } from "@/model/value-objects";
import { SessionStatus } from "@/model/enums";
import { logger } from "@/shared/utils/logger";
import { config } from "@/infrastructure/config";
import {
  CreatePlayerRequest,
  CreatePlayerResponse,
  UpdatePlayerRequest,
  UpdatePlayerResponse,
  GetPlayerResponse,
  ListPlayersResponse,
  AddBankrollRequest,
  AddBankrollResponse,
} from "../dto/player-dto";
import { BaseUseCase } from "./base-use-case";

export class CreatePlayerUseCase extends BaseUseCase {
  async execute(request: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    return this.executeWithTransaction(
      async () => {
        // Check if player with email already exists
        if (request.email) {
          const existingPlayer = await this.unitOfWork.players.findByEmail(
            request.email
          );
          if (existingPlayer) {
            throw new Error("Player with this email already exists");
          }
        }

        const initialBankroll = request.initialBankroll
          ? new Money(
              request.initialBankroll.amount,
              request.initialBankroll.currency
            )
          : new Money(0, config.poker.defaultCurrency);

        const player = Player.create(
          request.name,
          request.email,
          initialBankroll
        );

        await this.unitOfWork.players.save(player);

        logger.info("Player created successfully", {
          playerId: player.id.value,
          name: player.name,
          email: player.email,
        });

        return {
          id: player.id.value,
          name: player.name,
          email: player.email || undefined,
          bankroll: {
            amount: player.currentBankroll.amount,
            currency: player.currentBankroll.currency,
          },
          createdAt: player.createdAt,
        };
      },
      "CreatePlayerUseCase",
      { request }
    );
  }
}

export class UpdatePlayerUseCase extends BaseUseCase {
  async execute(request: UpdatePlayerRequest): Promise<UpdatePlayerResponse> {
    return this.executeWithTransaction(
      async () => {
        const playerId = new PlayerId(request.id);
        const player = await this.unitOfWork.players.findById(playerId);
        if (!player) {
          throw new Error("Player not found");
        }

        // Check if email is being changed and if it already exists
        if (request.email && request.email !== player.email) {
          const existingPlayer = await this.unitOfWork.players.findByEmail(
            request.email
          );
          if (existingPlayer) {
            throw new Error("Player with this email already exists");
          }
        }

        if (request.name) {
          player.updateName(request.name);
        }
        if (request.email !== undefined) {
          player.updateEmail(request.email);
        }

        await this.unitOfWork.players.save(player);

        logger.info("Player updated successfully", {
          playerId: player.id.value,
          updates: request,
        });

        return {
          id: player.id.value,
          name: player.name,
          email: player.email || undefined,
          bankroll: {
            amount: player.currentBankroll.amount,
            currency: player.currentBankroll.currency,
          },
          updatedAt: new Date(),
        };
      },
      "UpdatePlayerUseCase",
      { request }
    );
  }
}

export class GetPlayerUseCase extends BaseUseCase {
  async execute(playerId: string): Promise<GetPlayerResponse> {
    return this.executeReadOnly(
      async () => {
        const id = new PlayerId(playerId);
        const player = await this.unitOfWork.players.findById(id);
        if (!player) {
          throw new Error("Player not found");
        }

        // Get player's sessions to calculate stats
        const sessions = await this.unitOfWork.sessions.findByPlayerId(id);
        const statsService = new PlayerStatsService();
        const stats = statsService.calculateStats(player, sessions);

        return {
          id: player.id.value,
          name: player.name,
          email: player.email || undefined,
          bankroll: {
            amount: player.currentBankroll.amount,
            currency: player.currentBankroll.currency,
          },
          totalSessions: stats.totalSessions,
          totalWinnings: {
            amount: stats.netProfit.amount,
            currency: stats.netProfit.currency,
          },
          winRate: stats.winRate,
          createdAt: player.createdAt,
          updatedAt: player.updatedAt,
        };
      },
      "GetPlayerUseCase",
      { playerId }
    );
  }
}

export class ListPlayersUseCase extends BaseUseCase {
  async execute(
    page: number = 1,
    limit: number = 10
  ): Promise<ListPlayersResponse> {
    return this.executeReadOnly(
      async () => {
        const players = await this.unitOfWork.players.findAll();
        const total = players.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPlayers = players.slice(startIndex, endIndex);

        const statsService = new PlayerStatsService();

        const playerResponses = await Promise.all(
          paginatedPlayers.map(async (player) => {
            // Get player's sessions to calculate stats
            const sessions = await this.unitOfWork.sessions.findByPlayerId(
              player.id
            );
            const stats = statsService.calculateStats(player, sessions);

            return {
              id: player.id.value,
              name: player.name,
              email: player.email || undefined,
              bankroll: {
                amount: player.currentBankroll.amount,
                currency: player.currentBankroll.currency,
              },
              totalSessions: stats.totalSessions,
              totalWinnings: {
                amount: stats.netProfit.amount,
                currency: stats.netProfit.currency,
              },
              winRate: stats.winRate,
              createdAt: player.createdAt,
              updatedAt: player.updatedAt,
            };
          })
        );

        return {
          players: playerResponses,
          total,
          page,
          limit,
        };
      },
      "ListPlayersUseCase",
      { page, limit }
    );
  }
}

export class AddBankrollUseCase extends BaseUseCase {
  async execute(request: AddBankrollRequest): Promise<AddBankrollResponse> {
    return this.executeWithTransaction(
      async () => {
        const playerId = new PlayerId(request.playerId);
        const player = await this.unitOfWork.players.findById(playerId);
        if (!player) {
          throw new Error("Player not found");
        }

        const amount = new Money(
          request.amount.amount,
          request.amount.currency
        );
        player.adjustBankroll(amount);

        await this.unitOfWork.players.save(player);

        logger.info("Bankroll added successfully", {
          playerId: player.id.value,
          addedAmount: amount.amount,
          newBankroll: player.currentBankroll.amount,
        });

        return {
          playerId: player.id.value,
          newBankroll: {
            amount: player.currentBankroll.amount,
            currency: player.currentBankroll.currency,
          },
          addedAmount: {
            amount: amount.amount,
            currency: amount.currency,
          },
          addedAt: new Date(),
        };
      },
      "AddBankrollUseCase",
      { request }
    );
  }
}

export class DeletePlayerUseCase extends BaseUseCase {
  async execute(playerId: string): Promise<void> {
    return this.executeWithTransaction(
      async () => {
        const id = new PlayerId(playerId);
        const player = await this.unitOfWork.players.findById(id);
        if (!player) {
          throw new Error("Player not found");
        }

        // Check if player has any active sessions
        const sessions = await this.unitOfWork.sessions.findByPlayerId(id);
        const hasActiveSessions = sessions.some(
          (session) => session.status === SessionStatus.ACTIVE
        );

        if (hasActiveSessions) {
          throw new Error("Cannot delete player with active sessions");
        }

        await this.unitOfWork.players.delete(id);

        logger.info("Player deleted successfully", {
          playerId: player.id.value,
          name: player.name,
        });
      },
      "DeletePlayerUseCase",
      { playerId }
    );
  }
}
