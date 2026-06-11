import { UserId } from "@/model/entities";
import { GetUserProfileResponse } from "../../dto/user-dto";
import { BaseUseCase } from "../base-use-case";

export class GetUserProfileUseCase extends BaseUseCase {
  async execute(userId: string): Promise<GetUserProfileResponse> {
    return this.executeReadOnly(async () => {
      const user = await this.unitOfWork.users.findById(new UserId(userId));

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id.value,
        name: user.name,
        email: user.email,
        defaultPlayerId: user.defaultPlayerId?.value,
        preferredLanguage: user.preferredLanguage,
        defaultCurrency: user.defaultCurrency,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }, "GetUserProfileUseCase", { userId });
  }
}
