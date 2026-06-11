import {
  Hand,
  HandId,
  PlayerId,
  SessionId,
  UserId,
} from "@/model/entities";
import { CaptureType, HandStateV1 } from "@/model/hand-state";
import { HandRow } from "../types";

export class HandMapper {
  static toDomain(row: HandRow): Hand {
    return new Hand(
      new HandId(row.id),
      new SessionId(row.session_id),
      new UserId(row.owner_user_id),
      row.capture_type as CaptureType,
      row.hand_state as HandStateV1,
      row.currency,
      row.hero_player_id ? new PlayerId(row.hero_player_id) : undefined,
      row.pot_amount !== null ? Number(row.pot_amount) : undefined,
      row.net_result !== null ? Number(row.net_result) : undefined,
      row.tags ?? [],
      row.note || undefined,
      row.schema_version,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  static toPersistence(hand: Hand): HandRow {
    return {
      id: hand.id.value,
      session_id: hand.sessionId.value,
      owner_user_id: hand.ownerUserId.value,
      capture_type: hand.captureType,
      hero_player_id: hand.heroPlayerId?.value ?? null,
      pot_amount:
        hand.potAmount !== undefined ? hand.potAmount.toString() : null,
      net_result:
        hand.netResult !== undefined ? hand.netResult.toString() : null,
      currency: hand.currency,
      tags: [...hand.tags],
      note: hand.note ?? null,
      hand_state: hand.handState as Record<string, unknown>,
      schema_version: hand.schemaVersion,
      created_at: hand.createdAt,
      updated_at: hand.updatedAt,
    };
  }
}
