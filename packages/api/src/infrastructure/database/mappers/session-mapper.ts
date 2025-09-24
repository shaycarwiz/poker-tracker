// Session data mapper - converts between domain objects and database rows

import { PlayerId, Session, SessionId, Transaction } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";
import { SessionStatus } from "@/model/enums";
import { SessionRow } from "../types";

export class SessionMapper {
  static toDomain(row: SessionRow, transactions: Transaction[] = []): Session {
    // Create Session instance directly using constructor
    // This ensures proper initialization of the domain object
    return new Session(
      new SessionId(row.id),
      new PlayerId(row.player_id),
      row.location,
      new Stakes(
        new Money(row.small_blind, row.currency),
        new Money(row.big_blind, row.currency),
        row.ante ? new Money(row.ante, row.currency) : undefined
      ),
      new Date(row.start_time),
      row.end_time ? new Date(row.end_time) : undefined,
      row.status as SessionStatus,
      transactions,
      row.notes || undefined,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  static toPersistence(session: Session): SessionRow {
    return {
      id: session.id.value,
      player_id: session.playerId.value,
      location: session.location,
      small_blind: session.stakes.smallBlind.amount,
      big_blind: session.stakes.bigBlind.amount,
      ante: session.stakes.ante?.amount || null,
      currency: session.stakes.bigBlind.currency,
      start_time: session.startTime,
      end_time: session.endTime || null,
      status: session.status,
      notes: session.notes || null,
      created_at: session.createdAt,
      updated_at: session.updatedAt,
    };
  }
}
