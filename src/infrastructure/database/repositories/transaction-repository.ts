// PostgreSQL implementation of TransactionRepository

import {
  PlayerId,
  SessionId,
  Transaction,
  TransactionId,
} from "@/model/entities";
import { TransactionRepository } from "@/model/repositories";
import { DatabaseConnection } from "../connection";
import { TransactionMapper } from "../mappers/transaction-mapper";
import { logger } from "@/shared/utils/logger";
import { TransactionFilters } from "@/model";
import { TransactionRow } from "../types";

export class PostgresTransactionRepository implements TransactionRepository {
  private db = DatabaseConnection.getInstance();

  async findById(id: TransactionId): Promise<Transaction | null> {
    try {
      const result = await this.db.query<TransactionRow>(
        "SELECT * FROM transactions WHERE id = $1",
        [id.value]
      );

      if (!result.rows[0] || result.rows.length === 0) return null;

      return TransactionMapper.toDomain(result.rows[0]);
    } catch (error) {
      logger.error("Error finding transaction by ID", {
        transactionId: id.value,
        error,
      });
      throw new Error("Failed to find transaction");
    }
  }

  async findBySessionId(sessionId: SessionId): Promise<Transaction[]> {
    try {
      const result = await this.db.query<TransactionRow>(
        "SELECT * FROM transactions WHERE session_id = $1 ORDER BY timestamp ASC",
        [sessionId.value]
      );

      return result.rows.map(TransactionMapper.toDomain);
    } catch (error) {
      logger.error("Error finding transactions by session ID", {
        sessionId: sessionId.value,
        error,
      });
      throw new Error("Failed to find transactions");
    }
  }

  async findByPlayerId(playerId: PlayerId): Promise<Transaction[]> {
    try {
      const result = await this.db.query<TransactionRow>(
        "SELECT * FROM transactions WHERE player_id = $1 ORDER BY timestamp DESC",
        [playerId.value]
      );

      return result.rows.map((row) => TransactionMapper.toDomain(row));
    } catch (error) {
      logger.error("Error finding transactions by player ID", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to find transactions");
    }
  }

  async findByFilters(filters: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = "SELECT * FROM transactions WHERE 1=1";
      const params: unknown[] = [];
      let paramCount = 0;

      if (filters.sessionId) {
        paramCount++;
        query += ` AND session_id = $${paramCount}`;
        params.push(filters.sessionId);
      }

      if (filters.playerId) {
        paramCount++;
        query += ` AND player_id = $${paramCount}`;
        params.push(filters.playerId);
      }

      if (filters.type) {
        paramCount++;
        query += ` AND type = $${paramCount}`;
        params.push(filters.type);
      }

      if (filters.dateFrom) {
        paramCount++;
        query += ` AND timestamp >= $${paramCount}`;
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        paramCount++;
        query += ` AND timestamp <= $${paramCount}`;
        params.push(filters.dateTo);
      }

      if (filters.minAmount) {
        paramCount++;
        query += ` AND amount >= $${paramCount}`;
        params.push(filters.minAmount);
      }

      if (filters.maxAmount) {
        paramCount++;
        query += ` AND amount <= $${paramCount}`;
        params.push(filters.maxAmount);
      }

      query += " ORDER BY timestamp DESC";

      const result = await this.db.query<TransactionRow>(query, params);

      return result.rows.map(TransactionMapper.toDomain);
    } catch (error) {
      logger.error("Error finding transactions by filters", { filters, error });
      throw new Error("Failed to find transactions by filters");
    }
  }

  async save(transaction: Transaction): Promise<void> {
    try {
      const data = TransactionMapper.toPersistence(transaction, new Date());

      await this.db.query(
        `
        INSERT INTO transactions (id, session_id, player_id, type, amount, currency, timestamp, description, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          session_id = EXCLUDED.session_id,
          player_id = EXCLUDED.player_id,
          type = EXCLUDED.type,
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          timestamp = EXCLUDED.timestamp,
          description = EXCLUDED.description,
          notes = EXCLUDED.notes
      `,
        [
          data.id,
          data.session_id,
          data.player_id,
          data.type,
          data.amount,
          data.currency,
          data.timestamp,
          data.description,
          data.notes,
        ]
      );
    } catch (error) {
      logger.error("Error saving transaction", {
        transactionId: transaction.id.value,
        error,
      });
      throw new Error("Failed to save transaction");
    }
  }

  async delete(id: TransactionId): Promise<void> {
    try {
      await this.db.query("DELETE FROM transactions WHERE id = $1", [id.value]);
    } catch (error) {
      logger.error("Error deleting transaction", {
        transactionId: id.value,
        error,
      });
      throw new Error("Failed to delete transaction");
    }
  }
}
