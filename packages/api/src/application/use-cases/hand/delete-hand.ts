import { HandId, UserId } from "@/model/entities";
import { logger } from "@/shared/utils/logger";
import { BaseUseCase } from "../base-use-case";

export class DeleteHandUseCase extends BaseUseCase {
  async execute(handId: string, userId: string): Promise<void> {
    return this.executeWithTransaction(async () => {
      const id = new HandId(handId);
      const user = new UserId(userId);

      const hand = await this.unitOfWork.hands.findById(id);

      if (!hand || !hand.isOwnedBy(user)) {
        throw new Error("Hand not found");
      }

      await this.unitOfWork.hands.delete(id);

      logger.info("Hand deleted successfully", { handId });
    }, "DeleteHandUseCase", { handId, userId });
  }
}
