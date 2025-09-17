// Database connection management

import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { config } from "../config";
import { logger } from "@/shared/utils/logger";

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.username,
      password: config.database.password,
      ssl: config.database.ssl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return error after 2s if connection fails
    });

    this.pool.on("error", (err) => {
      logger.error("Unexpected error on idle client", err);
    });
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }

    return DatabaseConnection.instance;
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async query<T extends QueryResultRow = Record<string, unknown>>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const client = await this.getClient();

    try {
      const result = await client.query(text, params);

      return result as QueryResult<T>;
    } finally {
      client.release();
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query("BEGIN");
      const result = await callback(client);

      await client.query("COMMIT");

      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
