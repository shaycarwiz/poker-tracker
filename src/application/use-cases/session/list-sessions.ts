// List Sessions Use Case

import { SessionStatus } from "@/model/enums";
import {
  ListSessionsRequest,
  ListSessionsResponse,
} from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";
import { SessionFilters } from "@/model";

export class ListSessionsUseCase extends BaseUseCase {
  async execute(request: ListSessionsRequest): Promise<ListSessionsResponse> {
    return this.executeReadOnly(
      async () => {
        const page = request.page || 1;
        const limit = request.limit || 10;

        // Build filters for repository
        const filters: SessionFilters = {
          page,
          limit,
        };

        if (request.playerId) {
          filters.playerId = request.playerId;
        }

        if (request.status) {
          filters.status = request.status as SessionStatus;
        }

        if (request.startDate) {
          filters.dateFrom = request.startDate;
        }

        if (request.endDate) {
          filters.dateTo = request.endDate;
        }

        // Use repository's findByFilters method with proper database-level filtering
        const { sessions, total } =
          await this.unitOfWork.sessions.findByFilters(filters);

        const sessionResponses = sessions.map((session) => {
          const duration = session.endTime
            ? Math.floor(
                (session.endTime.getTime() - session.startTime.getTime()) /
                  (1000 * 60)
              )
            : undefined;

          return {
            sessionId: session.id.value,
            playerId: session.playerId.value,
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
        });

        return {
          sessions: sessionResponses,
          total,
          page,
          limit,
        };
      },
      "ListSessionsUseCase",
      { request }
    );
  }
}
