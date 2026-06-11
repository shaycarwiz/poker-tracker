import { SessionId, UserId } from "@/model/entities";
import { ListHandsResponse } from "../../dto/hand-dto";
import { BaseUseCase } from "../base-use-case";
import { mapHandToSummary } from "./hand-mappers";

export class ListHandsBySessionUseCase extends BaseUseCase {
  async execute(
    sessionId: string,
    userId: string
  ): Promise<ListHandsResponse> {
    return this.executeReadOnly(async () => {
      const id = new SessionId(sessionId);
      const user = new UserId(userId);

      const session = await this.unitOfWork.sessions.findById(id);

      if (!session || !session.isOwnedBy(user)) {
        throw new Error("Session not found");
      }

      const hands = await this.unitOfWork.hands.findBySessionId(id);

      return {
        hands: hands.map(mapHandToSummary),
      };
    }, "ListHandsBySessionUseCase", { sessionId, userId });
  }
}
