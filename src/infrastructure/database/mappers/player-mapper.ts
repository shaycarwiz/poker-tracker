// Player data mapper - converts between domain objects and database rows

import { Player, PlayerId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { PlayerRow } from "../types";

export class PlayerMapper {
  static toDomain(row: PlayerRow): Player {
    // Create a new Player instance using the private constructor approach
    const player = Object.create(Player.prototype);

    Object.assign(player, {
      id: new PlayerId(row.id),
      _name: row.name,
      _email: row.email,
      _currentBankroll: new Money(row.current_bankroll, row.currency),
      _totalSessions: row.total_sessions,
      _createdAt: new Date(row.created_at),
      _updatedAt: new Date(row.updated_at),
    });

    return player;
  }

  static toPersistence(player: Player): PlayerRow {
    return {
      id: player.id.value,
      name: player.name,
      email: player.email || null,
      current_bankroll: player.currentBankroll.amount,
      currency: player.currentBankroll.currency,
      total_sessions: player.totalSessions,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
    };
  }
}
