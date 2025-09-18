// PostgreSQL implementation of PlayerRepository

import { Player, PlayerId } from "@/model/entities";
import { PlayerRepository } from "@/model/repositories";
import { DatabaseConnection } from "../connection";
import { PlayerMapper } from "../mappers/player-mapper";
import { logger } from "@/shared/utils/logger";
import { PlayerRow } from "../types";

export class PostgresPlayerRepository implements PlayerRepository {
  private db = DatabaseConnection.getInstance();

  async findById(id: PlayerId): Promise<Player | null> {
    try {
      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players WHERE id = $1",
        [id.value]
      );

      if (!result.rows[0] || result.rows.length === 0) return null;

      return PlayerMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding player by ID", { playerId: id.value, error });
      throw new Error("Failed to find player");
    }
  }

  async findByEmail(email: string): Promise<Player | null> {
    try {
      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players WHERE email = $1",
        [email]
      );

      if (!result.rows[0] || result.rows.length === 0) return null;

      return PlayerMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding player by email", { email, error });
      throw new Error("Failed to find player by email");
    }
  }

  async findByGoogleId(googleId: string): Promise<Player | null> {
    try {
      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players WHERE google_id = $1",
        [googleId]
      );

      if (!result.rows[0] || result.rows.length === 0) return null;

      return PlayerMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding player by Google ID", { googleId, error });
      throw new Error("Failed to find player by Google ID");
    }
  }

  async findAll(): Promise<Player[]> {
    try {
      const result = await this.db.query<PlayerRow>(
        "SELECT * FROM players ORDER BY created_at DESC"
      );

      return result.rows.map(PlayerMapper.toDomain);
    } catch (error) {
      logger.error("Error finding all players", { error });
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
        INSERT INTO players (id, name, email, google_id, current_bankroll, currency, total_sessions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          google_id = EXCLUDED.google_id,
          current_bankroll = EXCLUDED.current_bankroll,
          currency = EXCLUDED.currency,
          total_sessions = EXCLUDED.total_sessions,
          updated_at = EXCLUDED.updated_at
      `,
        [
          data.id,
          data.name,
          data.email,
          data.google_id,
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
