// Get Player Use Case

import { PlayerId } from "@/model/entities";
import { PlayerStatsService } from "@/model/domain-services";
import { GetPlayerResponse } from "../../dto/player-dto";
import { BaseUseCase } from "../base-use-case";

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
          preferredLanguage: player.preferredLanguage,
          createdAt: player.createdAt,
          updatedAt: player.updatedAt,
        };
      },
      "GetPlayerUseCase",
      { playerId }
    );
  }
}
