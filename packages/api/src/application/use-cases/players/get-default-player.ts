import { UserId } from "@/model/entities";
import { GetPlayerResponse } from "../../dto/player-dto";
import { BaseUseCase } from "../base-use-case";
import { PlayerStatsService } from "@/model/domain-services";

export class GetDefaultPlayerUseCase extends BaseUseCase {
  async execute(userId: string): Promise<GetPlayerResponse> {
    return this.executeReadOnly(async () => {
      const user = await this.unitOfWork.users.findById(new UserId(userId));

      if (!user || !user.defaultPlayerId) {
        throw new Error("Default player not found");
      }

      const player = await this.unitOfWork.players.findById(
        user.defaultPlayerId
      );

      if (!player) {
        throw new Error("Default player not found");
      }

      const sessions = await this.unitOfWork.sessions.findByUserId(user.id);
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
    }, "GetDefaultPlayerUseCase", { userId });
  }
}
