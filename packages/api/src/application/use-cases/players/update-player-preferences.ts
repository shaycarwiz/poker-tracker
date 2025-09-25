import { Money } from "@/model/value-objects";
import { NotFoundError, API_ERROR_CODES } from "../../../shared";
import { BaseUseCase } from "../base-use-case";

export interface UpdatePlayerPreferencesRequest {
  email: string;
  preferredLanguage?: string;
  defaultCurrency?: string;
}

export interface UpdatePlayerPreferencesResponse {
  preferredLanguage: string;
  defaultCurrency: string;
}

export class UpdatePlayerPreferencesUseCase extends BaseUseCase {
  async execute(
    request: UpdatePlayerPreferencesRequest
  ): Promise<UpdatePlayerPreferencesResponse> {
    return this.executeWithTransaction(
      async () => {
        const player = await this.unitOfWork.players.findByEmail(request.email);

        if (!player) {
          throw new NotFoundError(API_ERROR_CODES.BUSINESS_PLAYER_NOT_FOUND);
        }

        // Update preferred language if provided
        if (request.preferredLanguage) {
          player.updatePreferredLanguage(request.preferredLanguage);
        }

        // Update default currency if provided
        if (request.defaultCurrency) {
          // For now, we'll update the current bankroll currency
          // In a more complete implementation, we'd have a separate defaultCurrency field
          const currentAmount = player.currentBankroll.amount;
          const currentCurrency = player.currentBankroll.currency;

          if (currentCurrency !== request.defaultCurrency) {
            player.adjustBankroll(new Money(-currentAmount, currentCurrency));
            player.adjustBankroll(
              new Money(currentAmount, request.defaultCurrency)
            );
          }
        }

        // Save the updated player
        await this.unitOfWork.players.save(player);

        return {
          preferredLanguage: player.preferredLanguage,
          defaultCurrency: player.currentBankroll.currency,
        };
      },
      "UpdatePlayerPreferencesUseCase",
      { request }
    );
  }
}
