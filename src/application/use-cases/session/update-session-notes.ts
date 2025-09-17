// Update Session Notes Use Case

import { SessionId } from "@/model/entities";
import { SessionStatus } from "@/model/enums";
import { logger } from "@/shared/utils/logger";
import {
  UpdateSessionNotesRequest,
  UpdateSessionNotesResponse,
} from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";

export class UpdateSessionNotesUseCase extends BaseUseCase {
  async execute(
    request: UpdateSessionNotesRequest,
  ): Promise<UpdateSessionNotesResponse> {
    return this.executeWithTransactionAndEvents(
      async () => {
        const sessionId = new SessionId(request.sessionId);
        const session = await this.unitOfWork.sessions.findById(sessionId);

        if (!session) {
          throw new Error("Session not found");
        }

        if (session.status !== SessionStatus.ACTIVE) {
          throw new Error("Session is not active");
        }

        session.updateNotes(request.notes);

        await this.unitOfWork.sessions.save(session);

        logger.info("Session notes updated successfully", {
          sessionId: session.id.value,
          playerId: session.playerId.value,
        });

        return {
          result: {
            sessionId: session.id.value,
            notes: session.notes || "",
            updatedAt: new Date(),
          },
          entity: session,
        };
      },
      "UpdateSessionNotesUseCase",
      { request },
    );
  }
}
