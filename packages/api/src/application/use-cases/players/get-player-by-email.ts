import { UnitOfWork } from "@/model/repositories";
import { GetPlayerResponse } from "../../dto/player-dto";
import { NotFoundError, API_ERROR_CODES } from "../../../shared";

export class GetPlayerByEmailUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(email: string): Promise<GetPlayerResponse> {
    const player = await this.unitOfWork.players.findByEmail(email);

    if (!player) {
      throw new NotFoundError(API_ERROR_CODES.BUSINESS_PLAYER_NOT_FOUND);
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
      preferredLanguage: player.preferredLanguage,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
  }
}
