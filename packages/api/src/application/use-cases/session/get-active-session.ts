import { UserId } from "@/model/entities";
import { GetSessionResponse } from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";
import { mapSessionToResponse } from "./get-session";

export class GetActiveSessionUseCase extends BaseUseCase {
  async execute(userId: string): Promise<GetSessionResponse | null> {
    return this.executeReadOnly(async () => {
      const session = await this.unitOfWork.sessions.findActiveByUserId(
        new UserId(userId)
      );

      if (!session) {
        return null;
      }

      return mapSessionToResponse(session);
    }, "GetActiveSessionUseCase", { userId });
  }
}
