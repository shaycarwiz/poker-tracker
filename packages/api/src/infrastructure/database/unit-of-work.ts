// Unit of Work implementation for managing database transactions

import { UnitOfWork } from "@/model/repositories";
import { PostgresPlayerRepository } from "./repositories/player-repository";
import { PostgresSessionRepository } from "./repositories/session-repository";
import { PostgresTransactionRepository } from "./repositories/transaction-repository";
import { DatabaseConnection } from "./connection";
import { logger } from "@/shared/utils/logger";
import { PoolClient } from "pg";

export class PostgresUnitOfWork implements UnitOfWork {
  public readonly players: PostgresPlayerRepository;
  public readonly sessions: PostgresSessionRepository;
  public readonly transactions: PostgresTransactionRepository;

  private db = DatabaseConnection.getInstance();
  private client: PoolClient | null = null;

  constructor() {
    this.players = new PostgresPlayerRepository();
    this.sessions = new PostgresSessionRepository();
    this.transactions = new PostgresTransactionRepository();
  }

  async begin(): Promise<void> {
    try {
      this.client = await this.db.getClient();
      await this.client.query("BEGIN");
      logger.debug("Database transaction started");
    } catch (error) {
      logger.error("Error beginning transaction", { error });
      throw new Error("Failed to begin transaction");
    }
  }

  async commit(): Promise<void> {
    if (!this.client) {
      throw new Error("No active transaction to commit");
    }

    try {
      await this.client.query("COMMIT");
      this.client?.release();
      this.client = null;
      logger.debug("Database transaction committed");
    } catch (error) {
      logger.error("Error committing transaction", { error });
      this.client?.release();
      this.client = null;
      throw new Error("Failed to commit transaction");
    }
  }

  async rollback(): Promise<void> {
    if (!this.client) {
      throw new Error("No active transaction to rollback");
    }

    try {
      await this.client.query("ROLLBACK");
      this.client?.release();
      this.client = null;
      logger.debug("Database transaction rolled back");
    } catch (error) {
      logger.error("Error rolling back transaction", { error });
      this.client?.release();
      this.client = null;
      throw new Error("Failed to rollback transaction");
    }
  }
}
