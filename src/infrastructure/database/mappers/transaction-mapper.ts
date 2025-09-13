// Transaction data mapper - converts between domain objects and database rows

import {
  Transaction,
  TransactionId,
  SessionId,
  PlayerId,
} from "@/model/entities";
import { Money } from "@/model/value-objects";
import { TransactionType } from "@/model/enums";

export class TransactionMapper {
  static toDomain(row: any): Transaction {
    return new Transaction(
      new TransactionId(row.id),
      new SessionId(row.session_id),
      new PlayerId(row.player_id),
      row.type as TransactionType,
      new Money(row.amount, row.currency),
      new Date(row.timestamp),
      row.description,
      row.notes
    );
  }

  static toPersistence(transaction: Transaction): any {
    return {
      id: transaction.id.value,
      session_id: transaction.sessionId.value,
      player_id: transaction.playerId.value,
      type: transaction.type,
      amount: transaction.amount.amount,
      currency: transaction.amount.currency,
      timestamp: transaction.timestamp,
      description: transaction.description,
      notes: transaction.notes,
    };
  }
}
