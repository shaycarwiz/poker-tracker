// Player data mapper - converts between domain objects and database rows

import { Player, PlayerId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { PlayerRow } from "../types";

export class PlayerMapper {
  static toDomain(row: PlayerRow): Player {
    // Create Player instance directly using constructor
    // This ensures proper initialization of the domain object
    return new Player(
      new PlayerId(row.id),
      row.name,
      row.email || undefined,
      row.google_id || undefined,
      new Money(row.current_bankroll, row.currency),
      row.total_sessions,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  static toPersistence(player: Player): PlayerRow {
    return {
      id: player.id.value,
      name: player.name,
      email: player.email || null,
      google_id: player.googleId || null,
      current_bankroll: player.currentBankroll.amount,
      currency: player.currentBankroll.currency,
      total_sessions: player.totalSessions,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
    };
  }
}
