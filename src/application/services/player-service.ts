// Player application service - Demonstrates data access layer usage

import { Player, PlayerId } from "@/model/entities";
import { PlayerRepository, UnitOfWork } from "@/model/repositories";
import { Money } from "@/model/value-objects";
import { logger } from "@/shared/utils/logger";

export class PlayerService {
  constructor(
    private playerRepository: PlayerRepository,
    private unitOfWork: UnitOfWork
  ) {}

  async createPlayer(
    name: string,
    email?: string,
    initialBankroll?: Money
  ): Promise<Player> {
    try {
      await this.unitOfWork.begin();

      // Check if email already exists
      if (email) {
        const existingPlayer = await this.playerRepository.findByEmail(email);
        if (existingPlayer) {
          throw new Error("Player with this email already exists");
        }
      }

      const player = Player.create(name, email, initialBankroll);
      await this.playerRepository.save(player);

      await this.unitOfWork.commit();
      logger.info("Player created successfully", {
        playerId: player.id.value,
        name,
      });
      return player;
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error creating player", { name, email, error });
      throw error;
    }
  }

  async getPlayerById(playerId: PlayerId): Promise<Player | null> {
    try {
      return await this.playerRepository.findById(playerId);
    } catch (error) {
      logger.error("Error getting player by ID", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to get player");
    }
  }

  async getAllPlayers(): Promise<Player[]> {
    try {
      return await this.playerRepository.findAll();
    } catch (error) {
      logger.error("Error getting all players", { error });
      throw new Error("Failed to get players");
    }
  }

  async searchPlayersByName(name: string): Promise<Player[]> {
    try {
      return await this.playerRepository.findByName(name);
    } catch (error) {
      logger.error("Error searching players by name", { name, error });
      throw new Error("Failed to search players");
    }
  }

  async updatePlayerBankroll(playerId: PlayerId, amount: Money): Promise<void> {
    try {
      await this.unitOfWork.begin();

      const player = await this.playerRepository.findById(playerId);
      if (!player) {
        throw new Error("Player not found");
      }

      player.adjustBankroll(amount);
      await this.playerRepository.save(player);

      await this.unitOfWork.commit();
      logger.info("Player bankroll updated", {
        playerId: playerId.value,
        amount: amount.toString(),
      });
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error updating player bankroll", {
        playerId: playerId.value,
        error,
      });
      throw error;
    }
  }

  async getPlayerStats(playerId: PlayerId): Promise<any> {
    try {
      const player = await this.playerRepository.findById(playerId);
      if (!player) {
        throw new Error("Player not found");
      }

      const sessions = await this.unitOfWork.sessions.findCompletedByPlayerId(
        playerId
      );

      // Calculate basic stats
      const totalSessions = sessions.length;
      const totalBuyIn = sessions.reduce(
        (sum, s) => sum.add(s.totalBuyIn),
        new Money(0)
      );
      const totalCashOut = sessions.reduce(
        (sum, s) => sum.add(s.totalCashOut),
        new Money(0)
      );
      const netProfit = totalCashOut.subtract(totalBuyIn);
      const winningSessions = sessions.filter(
        (s) => s.netResult.amount > 0
      ).length;
      const winRate =
        totalSessions > 0 ? (winningSessions / totalSessions) * 100 : 0;

      return {
        player: {
          id: player.id.value,
          name: player.name,
          email: player.email,
          currentBankroll: player.currentBankroll.toString(),
        },
        stats: {
          totalSessions,
          totalBuyIn: totalBuyIn.toString(),
          totalCashOut: totalCashOut.toString(),
          netProfit: netProfit.toString(),
          winRate: Math.round(winRate * 100) / 100,
          winningSessions,
          losingSessions: totalSessions - winningSessions,
        },
        sessions: sessions.map((s) => ({
          id: s.id.value,
          location: s.location,
          stakes: s.stakes.formatted,
          startTime: s.startTime.toISOString(),
          endTime: s.endTime?.toISOString(),
          netResult: s.netResult.toString(),
          duration: s.duration?.minutes || 0,
        })),
      };
    } catch (error) {
      logger.error("Error getting player stats", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to get player stats");
    }
  }

  async deletePlayer(playerId: PlayerId): Promise<void> {
    try {
      await this.unitOfWork.begin();

      const player = await this.playerRepository.findById(playerId);
      if (!player) {
        throw new Error("Player not found");
      }

      // Check if player has active sessions
      const activeSession = await this.unitOfWork.sessions.findActiveByPlayerId(
        playerId
      );
      if (activeSession) {
        throw new Error("Cannot delete player with active sessions");
      }

      await this.playerRepository.delete(playerId);

      await this.unitOfWork.commit();
      logger.info("Player deleted successfully", { playerId: playerId.value });
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error deleting player", {
        playerId: playerId.value,
        error,
      });
      throw error;
    }
  }
}
