// Add Transaction Use Case

import { SessionId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { TransactionType, SessionStatus } from "@/model/enums";
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
        const session = await this.unitOfWork.sessions.findById(sessionId);
        if (!session) {
          throw new Error("Session not found");
        }

        if (session.status !== SessionStatus.ACTIVE) {
          throw new Error("Session is not active");
        }

        const amount = new Money(
          request.amount.amount,
          request.amount.currency
        );
        const transactionType = request.type as TransactionType;

        session.addTransaction(transactionType, amount, request.description);

        await this.unitOfWork.sessions.save(session);

        logger.info("Transaction added successfully", {
          sessionId: session.id.value,
          type: request.type,
          amount: amount.amount,
        });

        const lastTransaction =
          session.transactions[session.transactions.length - 1];
        return {
          result: {
            transactionId: lastTransaction?.id.value || "",
            sessionId: session.id.value,
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
