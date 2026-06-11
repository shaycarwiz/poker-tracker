import { injectable } from "tsyringe";
import { Player, PlayerId, UserId } from "@/model/entities";
import { PlayerRepository } from "@/model/repositories";
import { DatabaseConnection } from "../connection";
import { PlayerMapper } from "../mappers/player-mapper";
import { logger } from "@/shared/utils/logger";
import { PlayerRow } from "../types";

@injectable()
export class PostgresPlayerRepository implements PlayerRepository {
  private db = DatabaseConnection.getInstance();

  async findById(id: PlayerId): Promise<Player | null> {
    try {
      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players WHERE id = $1",
        [id.value]
      );

      if (!result.rows[0]) return null;

      return PlayerMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding player by ID", { playerId: id.value, error });
      throw new Error("Failed to find player");
    }
  }

  async findByOwnerUserId(userId: UserId): Promise<Player[]> {
    try {
      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players WHERE owner_user_id = $1 ORDER BY created_at ASC",
        [userId.value]
      );

      return result.rows.map(PlayerMapper.toDomain);
    } catch (error) {
      logger.error("Error finding players by owner user ID", {
        userId: userId.value,
        error,
      });
      throw new Error("Failed to find players");
    }
  }

  async findByOwnerUserIdPaginated(
    userId: UserId,
    page: number,
    limit: number
  ): Promise<{ players: Player[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const countResult = await this.db.query<{ total: string }>(
        "SELECT COUNT(*) as total FROM players WHERE owner_user_id = $1",
        [userId.value]
      );
      const total = parseInt(countResult.rows[0]!.total, 10);

      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players WHERE owner_user_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3",
        [userId.value, limit, offset]
      );

      return {
        players: result.rows.map(PlayerMapper.toDomain),
        total,
      };
    } catch (error) {
      logger.error("Error finding paginated players by owner", {
        userId: userId.value,
        error,
      });
      throw new Error("Failed to find players");
    }
  }

  async findByName(name: string): Promise<Player[]> {
    try {
      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players WHERE name ILIKE $1 ORDER BY created_at DESC",
        [`%${name}%`]
      );

      return result.rows.map(PlayerMapper.toDomain);
    } catch (error) {
      logger.error("Error finding players by name", { name, error });
      throw new Error("Failed to find players by name");
    }
  }

  async save(player: Player): Promise<void> {
    try {
      const data = PlayerMapper.toPersistence(player);

      await this.db.query(
        `
        INSERT INTO players (id, owner_user_id, linked_user_id, name, email, current_bankroll, currency, total_sessions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          owner_user_id = EXCLUDED.owner_user_id,
          linked_user_id = EXCLUDED.linked_user_id,
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          current_bankroll = EXCLUDED.current_bankroll,
          currency = EXCLUDED.currency,
          total_sessions = EXCLUDED.total_sessions,
          updated_at = EXCLUDED.updated_at
      `,
        [
          data.id,
          data.owner_user_id,
          data.linked_user_id,
          data.name,
          data.email,
          data.current_bankroll,
          data.currency,
          data.total_sessions,
          data.created_at,
          data.updated_at,
        ]
      );
    } catch (error) {
      logger.error("Error saving player", { playerId: player.id.value, error });
      throw new Error("Failed to save player");
    }
  }

  async delete(id: PlayerId): Promise<void> {
    try {
      await this.db.query("DELETE FROM players WHERE id = $1", [id.value]);
    } catch (error) {
      logger.error("Error deleting player", { playerId: id.value, error });
      throw new Error("Failed to delete player");
    }
  }
}
