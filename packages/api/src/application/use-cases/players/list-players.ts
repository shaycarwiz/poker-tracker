import { UserId } from "@/model/entities";
import { PlayerStatsService } from "@/model/domain-services";
import { ListPlayersResponse } from "../../dto/player-dto";
import { BaseUseCase } from "../base-use-case";

export class ListPlayersUseCase extends BaseUseCase {
  async execute(
    ownerUserId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ListPlayersResponse> {
    return this.executeReadOnly(
      async () => {
        const { players, total } =
          await this.unitOfWork.players.findByOwnerUserIdPaginated(
            new UserId(ownerUserId),
            page,
            limit
          );

        const sessions = await this.unitOfWork.sessions.findByUserId(
          new UserId(ownerUserId)
        );
        const statsService = new PlayerStatsService();

        const playerResponses = players.map((player) => {
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
        });

        return {
          players: playerResponses,
          total,
          page,
          limit,
        };
      },
      "ListPlayersUseCase",
      { ownerUserId, page, limit }
    );
  }
}
