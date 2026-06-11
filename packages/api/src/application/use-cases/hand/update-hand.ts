import { HandId, PlayerId, UserId } from "@/model/entities";
import { logger } from "@/shared/utils/logger";
import {
  UpdateHandRequest,
  UpdateHandResponse,
} from "../../dto/hand-dto";
import { BaseUseCase } from "../base-use-case";
import { mapHandToResponse } from "./hand-mappers";

export class UpdateHandUseCase extends BaseUseCase {
  async execute(request: UpdateHandRequest): Promise<UpdateHandResponse> {
    return this.executeWithTransaction(async () => {
      const handId = new HandId(request.handId);
      const userId = new UserId(request.userId);

      const hand = await this.unitOfWork.hands.findById(handId);

      if (!hand || !hand.isOwnedBy(userId)) {
        throw new Error("Hand not found");
      }

      const heroPlayerId = request.heroPlayerId
        ? new PlayerId(request.heroPlayerId)
        : undefined;

      if (heroPlayerId) {
        const player = await this.unitOfWork.players.findById(heroPlayerId);
        if (!player || !player.isOwnedBy(userId)) {
          throw new Error("Player not found");
        }
      }

      hand.updateState(
        request.handState,
        request.tags,
        request.note,
        heroPlayerId
      );

      await this.unitOfWork.hands.save(hand);

      logger.info("Hand updated successfully", { handId: hand.id.value });

      return mapHandToResponse(hand);
    }, "UpdateHandUseCase", { request });
  }
}
