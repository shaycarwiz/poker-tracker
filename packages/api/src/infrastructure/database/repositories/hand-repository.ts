import { injectable } from "tsyringe";
import { Hand, HandId, SessionId } from "@/model/entities";
import { HandRepository } from "@/model/repositories";
import { DatabaseConnection } from "../connection";
import { HandMapper } from "../mappers/hand-mapper";
import { logger } from "@/shared/utils/logger";
import { HandRow } from "../types";

@injectable()
export class PostgresHandRepository implements HandRepository {
  private db = DatabaseConnection.getInstance();

  async findById(id: HandId): Promise<Hand | null> {
    try {
      const result = await this.db.query<HandRow>(
        "SELECT * FROM hands WHERE id = $1",
        [id.value]
      );

      if (!result.rows[0]) return null;

      return HandMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding hand by ID", { handId: id.value, error });
      throw new Error("Failed to find hand");
    }
  }

  async findBySessionId(sessionId: SessionId): Promise<Hand[]> {
    try {
      const result = await this.db.query<HandRow>(
        "SELECT * FROM hands WHERE session_id = $1 ORDER BY created_at DESC",
        [sessionId.value]
      );

      return result.rows.map((row) => HandMapper.toDomain(row));
    } catch (error) {
      logger.error("Error finding hands by session ID", {
        sessionId: sessionId.value,
        error,
      });
      throw new Error("Failed to find hands");
    }
  }

  async save(hand: Hand): Promise<void> {
    try {
      const row = HandMapper.toPersistence(hand);

      await this.db.query(
        `INSERT INTO hands (
          id, session_id, owner_user_id, capture_type, hero_player_id,
          pot_amount, net_result, currency, tags, note, hand_state,
          schema_version, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          capture_type = EXCLUDED.capture_type,
          hero_player_id = EXCLUDED.hero_player_id,
          pot_amount = EXCLUDED.pot_amount,
          net_result = EXCLUDED.net_result,
          currency = EXCLUDED.currency,
          tags = EXCLUDED.tags,
          note = EXCLUDED.note,
          hand_state = EXCLUDED.hand_state,
          schema_version = EXCLUDED.schema_version,
          updated_at = EXCLUDED.updated_at`,
        [
          row.id,
          row.session_id,
          row.owner_user_id,
          row.capture_type,
          row.hero_player_id,
          row.pot_amount,
          row.net_result,
          row.currency,
          row.tags,
          row.note,
          JSON.stringify(row.hand_state),
          row.schema_version,
          row.created_at,
          row.updated_at,
        ]
      );
    } catch (error) {
      logger.error("Error saving hand", { handId: hand.id.value, error });
      throw new Error("Failed to save hand");
    }
  }

  async delete(id: HandId): Promise<void> {
    try {
      await this.db.query("DELETE FROM hands WHERE id = $1", [id.value]);
    } catch (error) {
      logger.error("Error deleting hand", { handId: id.value, error });
      throw new Error("Failed to delete hand");
    }
  }
}
