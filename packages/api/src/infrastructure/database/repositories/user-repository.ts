import { injectable } from "tsyringe";
import { User, UserId } from "@/model/entities";
import { UserRepository } from "@/model/repositories";
import { DatabaseConnection } from "../connection";
import { UserMapper } from "../mappers/user-mapper";
import { logger } from "@/shared/utils/logger";
import { UserRow } from "../types";

@injectable()
export class PostgresUserRepository implements UserRepository {
  private db = DatabaseConnection.getInstance();

  async findById(id: UserId): Promise<User | null> {
    try {
      const result = await this.db.query<UserRow>(
        "SELECT * FROM users WHERE id = $1",
        [id.value]
      );

      if (!result.rows[0]) return null;

      return UserMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding user by ID", { userId: id.value, error });
      throw new Error("Failed to find user");
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      const result = await this.db.query<UserRow>(
        "SELECT * FROM users WHERE google_id = $1",
        [googleId]
      );

      if (!result.rows[0]) return null;

      return UserMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding user by Google ID", { googleId, error });
      throw new Error("Failed to find user by Google ID");
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query<UserRow>(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (!result.rows[0]) return null;

      return UserMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding user by email", { email, error });
      throw new Error("Failed to find user by email");
    }
  }

  async save(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);

      await this.db.query(
        `
        INSERT INTO users (id, google_id, email, name, preferred_language, default_currency, default_player_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          google_id = EXCLUDED.google_id,
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          preferred_language = EXCLUDED.preferred_language,
          default_currency = EXCLUDED.default_currency,
          default_player_id = EXCLUDED.default_player_id,
          updated_at = EXCLUDED.updated_at
      `,
        [
          data.id,
          data.google_id,
          data.email,
          data.name,
          data.preferred_language,
          data.default_currency,
          data.default_player_id,
          data.created_at,
          data.updated_at,
        ]
      );
    } catch (error) {
      logger.error("Error saving user", { userId: user.id.value, error });
      throw new Error("Failed to save user");
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.db.query("DELETE FROM users WHERE id = $1", [id.value]);
    } catch (error) {
      logger.error("Error deleting user", { userId: id.value, error });
      throw new Error("Failed to delete user");
    }
  }
}
