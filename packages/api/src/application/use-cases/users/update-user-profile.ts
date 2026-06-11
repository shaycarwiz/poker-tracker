import { UserId } from "@/model/entities";
import {
  GetUserProfileResponse,
  UpdateUserProfileRequest,
} from "../../dto/user-dto";
import { BaseUseCase } from "../base-use-case";

export class UpdateUserProfileUseCase extends BaseUseCase {
  async execute(
    userId: string,
    request: UpdateUserProfileRequest
  ): Promise<GetUserProfileResponse> {
    return this.executeWithTransaction(async () => {
      const user = await this.unitOfWork.users.findById(new UserId(userId));

      if (!user) {
        throw new Error("User not found");
      }

      if (request.name) {
        user.updateName(request.name);
      }

      if (request.email) {
        user.updateEmail(request.email);
      }

      await this.unitOfWork.users.save(user);

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
    }, "UpdateUserProfileUseCase", { userId, request });
  }
}
