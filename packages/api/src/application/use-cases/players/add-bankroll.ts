// Add Bankroll Use Case

import { PlayerId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { logger } from "@/shared/utils/logger";
import { AddBankrollRequest, AddBankrollResponse } from "../../dto/player-dto";
import { BaseUseCase } from "../base-use-case";

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
          request.amount.currency,
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
      { request },
    );
  }
}
