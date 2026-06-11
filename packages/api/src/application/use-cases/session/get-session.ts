import { SessionId, UserId } from "@/model/entities";
import { GetSessionResponse } from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";

function mapSessionToResponse(
  session: import("@/model/entities").Session
): GetSessionResponse {
  const duration = session.endTime
    ? Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      )
    : undefined;

  return {
    sessionId: session.id.value,
    userId: session.userId.value,
    location: session.location,
    stakes: {
      smallBlind: session.stakes.smallBlind.amount,
      bigBlind: session.stakes.bigBlind.amount,
      currency: session.stakes.smallBlind.currency,
    },
    initialBuyIn: {
      amount: session.totalBuyIn.amount,
      currency: session.totalBuyIn.currency,
    },
    currentCashOut: {
      amount: session.totalCashOut.amount,
      currency: session.totalCashOut.currency,
    },
    profitLoss: {
      amount: session.netResult.amount,
      currency: session.netResult.currency,
    },
    status: session.status,
    notes: session.notes,
    transactions: session.transactions.map((t) => ({
      id: t.id.value,
      playerId: t.playerId.value,
      type: t.type,
      amount: {
        amount: t.amount.amount,
        currency: t.amount.currency,
      },
      description: t.description || undefined,
      createdAt: t.timestamp,
    })),
    startedAt: session.startTime,
    endedAt: session.endTime,
    duration,
  };
}

export class GetSessionUseCase extends BaseUseCase {
  async execute(
    sessionId: string,
    userId?: string
  ): Promise<GetSessionResponse> {
    return this.executeReadOnly(
      async () => {
        const id = new SessionId(sessionId);
        const session = await this.unitOfWork.sessions.findById(id);

        if (!session) {
          throw new Error("Session not found");
        }

        if (userId && !session.isOwnedBy(new UserId(userId))) {
          throw new Error("Session not found");
        }

        return mapSessionToResponse(session);
      },
      "GetSessionUseCase",
      { sessionId, userId }
    );
  }
}

export { mapSessionToResponse };
