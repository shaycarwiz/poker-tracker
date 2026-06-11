import { UserId } from "@/model/entities";
import {
  UpdateUserPreferencesRequest,
  UserPreferencesResponse,
} from "../../dto/user-dto";
import { BaseUseCase } from "../base-use-case";

export class UpdateUserPreferencesUseCase extends BaseUseCase {
  async execute(
    request: UpdateUserPreferencesRequest
  ): Promise<UserPreferencesResponse> {
    return this.executeWithTransaction(async () => {
      const user = await this.unitOfWork.users.findById(
        new UserId(request.userId)
      );

      if (!user) {
        throw new Error("User not found");
      }

      if (request.preferredLanguage) {
        user.updatePreferredLanguage(request.preferredLanguage);
      }

      if (request.defaultCurrency) {
        user.updateDefaultCurrency(request.defaultCurrency);
      }

      await this.unitOfWork.users.save(user);

      return {
        preferredLanguage: user.preferredLanguage,
        defaultCurrency: user.defaultCurrency,
      };
    }, "UpdateUserPreferencesUseCase", { request });
  }
}
