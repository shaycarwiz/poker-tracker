// Update Player Use Case

import { PlayerId } from "@/model/entities";
import { logger } from "@/shared/utils/logger";
import {
  UpdatePlayerRequest,
  UpdatePlayerResponse,
} from "../../dto/player-dto";
import { BaseUseCase } from "../base-use-case";

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
            request.email,
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
      { request },
    );
  }
}
