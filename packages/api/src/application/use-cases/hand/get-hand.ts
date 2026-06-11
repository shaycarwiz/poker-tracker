import { HandId, UserId } from "@/model/entities";
import { HandResponse } from "../../dto/hand-dto";
import { BaseUseCase } from "../base-use-case";
import { mapHandToResponse } from "./hand-mappers";

export class GetHandUseCase extends BaseUseCase {
  async execute(handId: string, userId: string): Promise<HandResponse> {
    return this.executeReadOnly(async () => {
      const id = new HandId(handId);
      const user = new UserId(userId);

      const hand = await this.unitOfWork.hands.findById(id);

      if (!hand || !hand.isOwnedBy(user)) {
        throw new Error("Hand not found");
      }

      return mapHandToResponse(hand);
    }, "GetHandUseCase", { handId, userId });
  }
}
