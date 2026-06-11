import { Player, UserId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { logger } from "@/shared/utils/logger";
import { config } from "@/infrastructure/config";
import {
  CreatePlayerRequest,
  CreatePlayerResponse,
} from "../../dto/player-dto";
import { BaseUseCase } from "../base-use-case";

export class CreatePlayerUseCase extends BaseUseCase {
  async execute(request: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    return this.executeWithTransaction(
      async () => {
        const initialBankroll = request.initialBankroll
          ? new Money(
              request.initialBankroll.amount,
              request.initialBankroll.currency
            )
          : new Money(0, config.poker.defaultCurrency);

        const player = Player.create(
          request.name,
          new UserId(request.ownerUserId),
          request.email,
          initialBankroll
        );

        await this.unitOfWork.players.save(player);

        logger.info("Player created successfully", {
          playerId: player.id.value,
          ownerUserId: request.ownerUserId,
          name: player.name,
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
