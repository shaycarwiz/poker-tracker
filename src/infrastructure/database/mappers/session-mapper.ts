// Session data mapper - converts between domain objects and database rows

import { Session, SessionId, PlayerId, Transaction } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";
import { SessionStatus } from "@/model/enums";
import { SessionRow } from "../types";

export class SessionMapper {
  static toDomain(row: SessionRow, transactions: Transaction[] = []): Session {
    const session = Object.create(Session.prototype);
    Object.assign(session, {
      id: new SessionId(row.id),
      playerId: new PlayerId(row.player_id),
      _location: row.location,
      _stakes: new Stakes(
        new Money(row.small_blind, row.currency),
        new Money(row.big_blind, row.currency),
        row.ante ? new Money(row.ante, row.currency) : undefined
      ),
      _startTime: new Date(row.start_time),
      _endTime: row.end_time ? new Date(row.end_time) : undefined,
      _status: row.status as SessionStatus,
      _transactions: transactions,
      _notes: row.notes,
      _createdAt: new Date(row.created_at),
      _updatedAt: new Date(row.updated_at),
    });
    return session;
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
