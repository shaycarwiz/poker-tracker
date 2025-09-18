import { UnitOfWork } from "@/model/repositories";
import { GetPlayerResponse } from "../../dto/player-dto";

export class GetPlayerByEmailUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(email: string): Promise<GetPlayerResponse> {
    const player = await this.unitOfWork.players.findByEmail(email);

    if (!player) {
      throw new Error("Player not found");
    }

    return {
      id: player.id.value,
      name: player.name,
      email: player.email,
      bankroll: {
        amount: player.currentBankroll.amount,
        currency: player.currentBankroll.currency,
      },
      totalSessions: player.totalSessions,
      totalWinnings: {
        amount: 0, // TODO: Calculate from sessions
        currency: player.currentBankroll.currency,
      },
      winRate: 0, // TODO: Calculate from sessions
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
  }
}
