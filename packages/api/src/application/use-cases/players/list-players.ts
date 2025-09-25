// List Players Use Case

import { PlayerStatsService } from "@/model/domain-services";
import { ListPlayersResponse } from "../../dto/player-dto";
import { BaseUseCase } from "../base-use-case";

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
              preferredLanguage: player.preferredLanguage,
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
