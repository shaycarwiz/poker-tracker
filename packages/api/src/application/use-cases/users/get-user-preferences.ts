import { UserId } from "@/model/entities";
import { UserPreferencesResponse } from "../../dto/user-dto";
import { BaseUseCase } from "../base-use-case";

export class GetUserPreferencesUseCase extends BaseUseCase {
  async execute(userId: string): Promise<UserPreferencesResponse> {
    return this.executeReadOnly(async () => {
      const user = await this.unitOfWork.users.findById(new UserId(userId));

      if (!user) {
        throw new Error("User not found");
      }

      return {
        preferredLanguage: user.preferredLanguage,
        defaultCurrency: user.defaultCurrency,
      };
    }, "GetUserPreferencesUseCase", { userId });
  }
}
