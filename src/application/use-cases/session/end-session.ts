// End Session Use Case

import { SessionId } from "@/model/entities";
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
        const session = await this.unitOfWork.sessions.findById(sessionId);
        if (!session) {
          throw new Error("Session not found");
        }

        if (session.status !== SessionStatus.ACTIVE) {
          throw new Error("Session is not active");
        }

        const finalCashOut = new Money(
          request.finalCashOut.amount,
          request.finalCashOut.currency
        );

        session.end(finalCashOut, request.notes);

        await this.unitOfWork.sessions.save(session);

        const duration = session.endTime
          ? Math.floor(
              (session.endTime.getTime() - session.startTime.getTime()) /
                (1000 * 60)
            )
          : 0;

        logger.info("Session ended successfully", {
          sessionId: session.id.value,
          playerId: session.playerId.value,
          profitLoss: session.netResult.amount,
          duration,
        });

        return {
          result: {
            sessionId: session.id.value,
            playerId: session.playerId.value,
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
