import { Player, PlayerId, UserId } from "@/model/entities";
import { Money } from "@/model/value-objects";
import { PlayerRow } from "../types";

export class PlayerMapper {
  static toDomain(row: PlayerRow): Player {
    return new Player(
      new PlayerId(row.id),
      new UserId(row.owner_user_id),
      row.name,
      row.email || undefined,
      row.linked_user_id ? new UserId(row.linked_user_id) : undefined,
      new Money(Number(row.current_bankroll), row.currency),
      row.total_sessions,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  static toPersistence(player: Player): PlayerRow {
    return {
      id: player.id.value,
      owner_user_id: player.ownerUserId.value,
      linked_user_id: player.linkedUserId?.value || null,
      name: player.name,
      email: player.email || null,
      current_bankroll: player.currentBankroll.amount.toString(),
      currency: player.currentBankroll.currency,
      total_sessions: player.totalSessions,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
    };
  }
}
