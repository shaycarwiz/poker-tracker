// Transaction data mapper - converts between domain objects and database rows

import {
  PlayerId,
  SessionId,
  Transaction,
  TransactionId,
} from "@/model/entities";
import { Money } from "@/model/value-objects";
import { TransactionType } from "@/model/enums";
import { TransactionRow } from "../types";
export class TransactionMapper {
  static toDomain(row: TransactionRow): Transaction {
    return new Transaction(
      new TransactionId(row.id),
      new SessionId(row.session_id),
      new PlayerId(row.player_id),
      row.type as TransactionType,
      new Money(row.amount, row.currency),
      new Date(row.timestamp),
      row.description || undefined,
      row.notes || undefined,
    );
  }

  static toPersistence(
    transaction: Transaction,
    createdAt: Date = new Date(),
  ): TransactionRow {
    return {
      id: transaction.id.value,
      session_id: transaction.sessionId.value,
      player_id: transaction.playerId.value,
      type: transaction.type,
      amount: transaction.amount.amount,
      currency: transaction.amount.currency,
      timestamp: transaction.timestamp,
      description: transaction.description || null,
      notes: transaction.notes || null,
      created_at: createdAt,
    };
  }
}
