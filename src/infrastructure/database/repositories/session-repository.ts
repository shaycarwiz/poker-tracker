// PostgreSQL implementation of SessionRepository

import { Session, SessionId, PlayerId } from "@/model/entities";
import { SessionRepository } from "@/model/repositories";
import { DatabaseConnection } from "../connection";
import { SessionMapper } from "../mappers/session-mapper";
import { TransactionMapper } from "../mappers/transaction-mapper";
import { logger } from "@/shared/utils/logger";
import { SessionStatus } from "@/model/enums";

export class PostgresSessionRepository implements SessionRepository {
  private db = DatabaseConnection.getInstance();

  async findById(id: SessionId): Promise<Session | null> {
    try {
      const result = await this.db.query(
        "SELECT * FROM sessions WHERE id = $1",
        [id.value]
      );

      if (result.rows.length === 0) return null;

      // Load transactions for this session
      const transactions = await this.loadTransactionsForSession(id);

      return SessionMapper.toDomain(result.rows[0], transactions);
    } catch (error) {
      logger.error("Error finding session by ID", {
        sessionId: id.value,
        error,
      });
      throw new Error("Failed to find session");
    }
  }

  async findByPlayerId(playerId: PlayerId): Promise<Session[]> {
    try {
      const result = await this.db.query(
        "SELECT * FROM sessions WHERE player_id = $1 ORDER BY start_time DESC",
        [playerId.value]
      );

      const sessions = await Promise.all(
        result.rows.map(async (row: any) => {
          const transactions = await this.loadTransactionsForSession(
            new SessionId(row.id)
          );
          return SessionMapper.toDomain(row, transactions);
        })
      );

      return sessions;
    } catch (error) {
      logger.error("Error finding sessions by player ID", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to find sessions");
    }
  }

  async findActiveByPlayerId(playerId: PlayerId): Promise<Session | null> {
    try {
      const result = await this.db.query(
        "SELECT * FROM sessions WHERE player_id = $1 AND status = $2",
        [playerId.value, SessionStatus.ACTIVE]
      );

      if (result.rows.length === 0) return null;

      const transactions = await this.loadTransactionsForSession(
        new SessionId(result.rows[0].id)
      );
      return SessionMapper.toDomain(result.rows[0], transactions);
    } catch (error) {
      logger.error("Error finding active session by player ID", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to find active session");
    }
  }

  async findCompletedByPlayerId(playerId: PlayerId): Promise<Session[]> {
    try {
      const result = await this.db.query(
        "SELECT * FROM sessions WHERE player_id = $1 AND status = $2 ORDER BY start_time DESC",
        [playerId.value, SessionStatus.COMPLETED]
      );

      const sessions = await Promise.all(
        result.rows.map(async (row: any) => {
          const transactions = await this.loadTransactionsForSession(
            new SessionId(row.id)
          );
          return SessionMapper.toDomain(row, transactions);
        })
      );

      return sessions;
    } catch (error) {
      logger.error("Error finding completed sessions by player ID", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to find completed sessions");
    }
  }

  async findRecentByPlayerId(
    playerId: PlayerId,
    limit: number
  ): Promise<Session[]> {
    try {
      const result = await this.db.query(
        "SELECT * FROM sessions WHERE player_id = $1 ORDER BY start_time DESC LIMIT $2",
        [playerId.value, limit]
      );

      const sessions = await Promise.all(
        result.rows.map(async (row: any) => {
          const transactions = await this.loadTransactionsForSession(
            new SessionId(row.id)
          );
          return SessionMapper.toDomain(row, transactions);
        })
      );

      return sessions;
    } catch (error) {
      logger.error("Error finding recent sessions by player ID", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to find recent sessions");
    }
  }

  async findByFilters(filters: any): Promise<Session[]> {
    try {
      let query = "SELECT * FROM sessions WHERE 1=1";
      const params: any[] = [];
      let paramCount = 0;

      if (filters.playerId) {
        paramCount++;
        query += ` AND player_id = $${paramCount}`;
        params.push(filters.playerId);
      }

      if (filters.status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
      }

      if (filters.dateFrom) {
        paramCount++;
        query += ` AND start_time >= $${paramCount}`;
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        paramCount++;
        query += ` AND start_time <= $${paramCount}`;
        params.push(filters.dateTo);
      }

      if (filters.location) {
        paramCount++;
        query += ` AND location ILIKE $${paramCount}`;
        params.push(`%${filters.location}%`);
      }

      query += " ORDER BY start_time DESC";

      const result = await this.db.query(query, params);

      const sessions = await Promise.all(
        result.rows.map(async (row: any) => {
          const transactions = await this.loadTransactionsForSession(
            new SessionId(row.id)
          );
          return SessionMapper.toDomain(row, transactions);
        })
      );

      return sessions;
    } catch (error) {
      logger.error("Error finding sessions by filters", { filters, error });
      throw new Error("Failed to find sessions by filters");
    }
  }

  async save(session: Session): Promise<void> {
    try {
      const data = SessionMapper.toPersistence(session);

      await this.db.query(
        `
        INSERT INTO sessions (id, player_id, location, small_blind, big_blind, ante, currency, start_time, end_time, status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          location = EXCLUDED.location,
          small_blind = EXCLUDED.small_blind,
          big_blind = EXCLUDED.big_blind,
          ante = EXCLUDED.ante,
          currency = EXCLUDED.currency,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at
      `,
        [
          data.id,
          data.player_id,
          data.location,
          data.small_blind,
          data.big_blind,
          data.ante,
          data.currency,
          data.start_time,
          data.end_time,
          data.status,
          data.notes,
          data.created_at,
          data.updated_at,
        ]
      );
    } catch (error) {
      logger.error("Error saving session", {
        sessionId: session.id.value,
        error,
      });
      throw new Error("Failed to save session");
    }
  }

  async delete(id: SessionId): Promise<void> {
    try {
      await this.db.query("DELETE FROM sessions WHERE id = $1", [id.value]);
    } catch (error) {
      logger.error("Error deleting session", { sessionId: id.value, error });
      throw new Error("Failed to delete session");
    }
  }

  private async loadTransactionsForSession(
    sessionId: SessionId
  ): Promise<any[]> {
    try {
      const result = await this.db.query(
        "SELECT * FROM transactions WHERE session_id = $1 ORDER BY timestamp ASC",
        [sessionId.value]
      );

      return result.rows.map((row: any) => TransactionMapper.toDomain(row));
    } catch (error) {
      logger.error("Error loading transactions for session", {
        sessionId: sessionId.value,
        error,
      });
      return [];
    }
  }
}
