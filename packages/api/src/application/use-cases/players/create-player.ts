// Create Player Use Case

import { Player } from "@/model/entities";
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
        // Check if player with email already exists
        if (request.email) {
          const existingPlayer = await this.unitOfWork.players.findByEmail(
            request.email,
          );

          if (existingPlayer) {
            throw new Error("Player with this email already exists");
          }
        }

        const initialBankroll = request.initialBankroll
          ? new Money(
            request.initialBankroll.amount,
            request.initialBankroll.currency,
          )
          : new Money(0, config.poker.defaultCurrency);

        const player = Player.create(
          request.name,
          request.email,
          initialBankroll,
        );

        await this.unitOfWork.players.save(player);

        logger.info("Player created successfully", {
          playerId: player.id.value,
          name: player.name,
          email: player.email,
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
      { request },
    );
  }
}
