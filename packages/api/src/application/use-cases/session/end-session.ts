import { PlayerId, SessionId, UserId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { SessionStatus } from "@/model/enums";
import { logger } from "@/shared/utils/logger";
import { EndSessionRequest, EndSessionResponse } from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";

export class EndSessionUseCase extends BaseUseCase {
  async execute(request: EndSessionRequest): Promise<EndSessionResponse> {
    return this.executeWithTransactionAndEvents(
      async () => {
        const sessionId = new SessionId(request.sessionId);
        const userId = new UserId(request.userId);
        const playerId = new PlayerId(request.playerId);

        const session = await this.unitOfWork.sessions.findById(sessionId);

        if (!session || !session.isOwnedBy(userId)) {
          throw new Error("Session not found");
        }

        if (session.status !== SessionStatus.ACTIVE) {
          throw new Error("Session is not active");
        }

        const player = await this.unitOfWork.players.findById(playerId);

        if (!player || !player.isOwnedBy(userId)) {
          throw new Error("Player not found");
        }

        const finalCashOut = new Money(
          request.finalCashOut.amount,
          request.finalCashOut.currency
        );

        session.end(playerId, finalCashOut, request.notes);
        await this.unitOfWork.sessions.save(session);

        const duration = session.endTime
          ? Math.floor(
              (session.endTime.getTime() - session.startTime.getTime()) /
                (1000 * 60)
            )
          : 0;

        logger.info("Session ended successfully", {
          sessionId: session.id.value,
          userId: session.userId.value,
          duration,
        });

        return {
          result: {
            sessionId: session.id.value,
            userId: session.userId.value,
            finalCashOut: {
              amount: finalCashOut.amount,
              currency: finalCashOut.currency,
            },
            profitLoss: {
              amount: session.netResult.amount,
              currency: session.netResult.currency,
            },
            duration,
            status: session.status,
            endedAt: session.endTime!,
          },
          entity: session,
        };
      },
      "EndSessionUseCase",
      { request }
    );
  }
}
