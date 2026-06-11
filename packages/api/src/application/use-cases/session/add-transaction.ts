import { PlayerId, SessionId, UserId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { SessionStatus, TransactionType } from "@/model/enums";
import { logger } from "@/shared/utils/logger";
import {
  AddTransactionRequest,
  AddTransactionResponse,
} from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";

export class AddTransactionUseCase extends BaseUseCase {
  async execute(
    request: AddTransactionRequest
  ): Promise<AddTransactionResponse> {
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

        const amount = new Money(
          request.amount.amount,
          request.amount.currency
        );
        const transactionType = request.type as TransactionType;

        session.addTransaction(
          playerId,
          transactionType,
          amount,
          request.description
        );

        await this.unitOfWork.sessions.save(session);

        logger.info("Transaction added successfully", {
          sessionId: session.id.value,
          playerId: playerId.value,
          type: request.type,
          amount: amount.amount,
        });

        const lastTransaction =
          session.transactions[session.transactions.length - 1];

        return {
          result: {
            transactionId: lastTransaction?.id.value || "",
            sessionId: session.id.value,
            playerId: playerId.value,
            type: request.type,
            amount: {
              amount: amount.amount,
              currency: amount.currency,
            },
            description: request.description || undefined,
            addedAt: new Date(),
          },
          entity: session,
        };
      },
      "AddTransactionUseCase",
      { request }
    );
  }
}
