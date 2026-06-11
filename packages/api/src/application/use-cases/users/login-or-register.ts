import { Player, User } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { logger } from "@/shared/utils/logger";
import { config } from "@/infrastructure/config";
import {
  LoginOrRegisterRequest,
  LoginOrRegisterResponse,
} from "../../dto/user-dto";
import { BaseUseCase } from "../base-use-case";

export class LoginOrRegisterUseCase extends BaseUseCase {
  async execute(
    request: LoginOrRegisterRequest
  ): Promise<LoginOrRegisterResponse> {
    return this.executeWithTransaction(async () => {
      let user = await this.unitOfWork.users.findByGoogleId(request.googleId);

      if (!user) {
        user = User.createFromGoogle(
          request.googleId,
          request.name,
          request.email
        );
        await this.unitOfWork.users.save(user);

        const defaultPlayer = Player.create(
          request.name,
          user.id,
          request.email,
          new Money(0, config.poker.defaultCurrency)
        );
        await this.unitOfWork.players.save(defaultPlayer);

        user.setDefaultPlayer(defaultPlayer.id);
        await this.unitOfWork.users.save(user);

        logger.info("User and default player created", {
          userId: user.id.value,
          playerId: defaultPlayer.id.value,
        });
      }

      if (!user.defaultPlayerId) {
        const defaultPlayer = Player.create(
          user.name,
          user.id,
          user.email,
          new Money(0, config.poker.defaultCurrency)
        );
        await this.unitOfWork.players.save(defaultPlayer);
        user.setDefaultPlayer(defaultPlayer.id);
        await this.unitOfWork.users.save(user);
      }

      return {
        userId: user.id.value,
        name: user.name,
        email: user.email,
        defaultPlayerId: user.defaultPlayerId!.value,
      };
    }, "LoginOrRegisterUseCase", { request });
  }
}
