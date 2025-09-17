// Migration runner with proper tracking and error handling

import { createHash } from "crypto";
import { readdirSync, readFileSync } from "fs";
import { extname, join } from "path";
import { DatabaseConnection } from "../connection";
import { logger } from "@/shared/utils/logger";

export interface MigrationInfo {
  filename: string;
  path: string;
  checksum: string;
  appliedAt?: Date;
  executionTimeMs?: number;
}

export interface MigrationResult {
  success: boolean;
  appliedMigrations: string[];
  skippedMigrations: string[];
  errors: string[];
  totalTimeMs: number;
}

export class MigrationRunner {
  private db: DatabaseConnection;
  private migrationsDir: string;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.migrationsDir = __dirname;
  }

  /**
   * Get all migration files sorted by filename
   */
  private getMigrationFiles(): string[] {
    const files = readdirSync(this.migrationsDir)
      .filter((file) => extname(file) === ".sql")
      .filter(
        (file) =>
          file.startsWith("0") || file.startsWith("1") || file.startsWith("2")
      )
      .sort();

    return files;
  }

  /**
   * Calculate checksum for a migration file
   */
  private calculateChecksum(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  /**
   * Get migration info from database
   */
  private async getAppliedMigrations(): Promise<Map<string, MigrationInfo>> {
    try {
      const result = await this.db.query(`
        SELECT filename, applied_at, checksum, execution_time_ms 
        FROM migrations 
        ORDER BY applied_at
      `);

      const appliedMigrations = new Map<string, MigrationInfo>();

      result.rows.forEach((row: any) => {
        appliedMigrations.set(row.filename, {
          filename: row.filename,
          path: join(this.migrationsDir, row.filename),
          checksum: row.checksum,
          appliedAt: new Date(row.applied_at),
          executionTimeMs: row.execution_time_ms,
        });
      });

      return appliedMigrations;
    } catch (error) {
      // If migrations table doesn't exist, return empty map
      logger.warn("Migrations table not found, assuming no migrations applied");

      return new Map();
    }
  }

  /**
   * Record a migration as applied
   */
  private async recordMigration(
    filename: string,
    checksum: string,
    executionTimeMs: number
  ): Promise<void> {
    await this.db.query(
      `
      INSERT INTO migrations (filename, checksum, execution_time_ms) 
      VALUES ($1, $2, $3)
    `,
      [filename, checksum, executionTimeMs]
    );
  }

  /**
   * Check if migration needs to be applied
   */
  private needsMigration(
    filename: string,
    checksum: string,
    appliedMigrations: Map<string, MigrationInfo>
  ): boolean {
    const applied = appliedMigrations.get(filename);

    if (!applied) return true;

    return applied.checksum !== checksum;
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: true,
      appliedMigrations: [],
      skippedMigrations: [],
      errors: [],
      totalTimeMs: 0,
    };

    try {
      logger.info("Starting migration process...");

      // Get all migration files
      const migrationFiles = this.getMigrationFiles();

      logger.info(`Found ${migrationFiles.length} migration files`);

      // Get applied migrations from database
      const appliedMigrations = await this.getAppliedMigrations();

      // Process each migration
      for (const filename of migrationFiles) {
        try {
          const migrationPath = join(this.migrationsDir, filename);
          const migrationContent = readFileSync(migrationPath, "utf8");
          const checksum = this.calculateChecksum(migrationContent);

          // Check if migration needs to be applied
          if (!this.needsMigration(filename, checksum, appliedMigrations)) {
            logger.info(`⏭️  Skipping ${filename} (already applied)`);
            result.skippedMigrations.push(filename);
            continue;
          }

          logger.info(`🔄 Running migration: ${filename}`);

          // Record start time for this migration
          const migrationStartTime = Date.now();

          // Run the migration
          await this.db.query(migrationContent);

          // Calculate execution time
          const executionTimeMs = Date.now() - migrationStartTime;

          // Record the migration
          await this.recordMigration(filename, checksum, executionTimeMs);

          logger.info(
            `✅ Migration ${filename} completed in ${executionTimeMs}ms`
          );
          result.appliedMigrations.push(filename);
        } catch (error) {
          const errorMsg = `Failed to run migration ${filename}: ${error}`;

          logger.error(errorMsg);
          result.errors.push(errorMsg);
          result.success = false;
        }
      }

      result.totalTimeMs = Date.now() - startTime;

      if (result.success) {
        logger.info(
          `🎉 All migrations completed successfully in ${result.totalTimeMs}ms`
        );
        logger.info(
          `Applied: ${result.appliedMigrations.length}, Skipped: ${result.skippedMigrations.length}`
        );
      } else {
        logger.error(
          `❌ Migration process failed with ${result.errors.length} errors`
        );
      }

      return result;
    } catch (error) {
      result.success = false;
      result.totalTimeMs = Date.now() - startTime;
      const errorMsg = `Migration process failed: ${error}`;

      logger.error(errorMsg);
      result.errors.push(errorMsg);

      return result;
    }
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    applied: MigrationInfo[];
    pending: MigrationInfo[];
    total: number;
  }> {
    const migrationFiles = this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();

    const applied: MigrationInfo[] = [];
    const pending: MigrationInfo[] = [];

    for (const filename of migrationFiles) {
      const migrationPath = join(this.migrationsDir, filename);
      const migrationContent = readFileSync(migrationPath, "utf8");
      const checksum = this.calculateChecksum(migrationContent);

      const migrationInfo: MigrationInfo = {
        filename,
        path: migrationPath,
        checksum,
      };

      const appliedMigration = appliedMigrations.get(filename);

      if (appliedMigration && appliedMigration.checksum === checksum) {
        if (appliedMigration.appliedAt) {
          migrationInfo.appliedAt = appliedMigration.appliedAt;
        }
        if (appliedMigration.executionTimeMs) {
          migrationInfo.executionTimeMs = appliedMigration.executionTimeMs;
        }
        applied.push(migrationInfo);
      } else {
        pending.push(migrationInfo);
      }
    }

    return {
      applied,
      pending,
      total: migrationFiles.length,
    };
  }

  /**
   * Rollback the last applied migration
   */
  async rollbackLast(): Promise<{
    success: boolean;
    rolledBackMigration?: string;
    error?: string;
  }> {
    try {
      // Get the last applied migration
      const result = await this.db.query<{ filename: string }>(`
        SELECT filename FROM migrations 
        ORDER BY applied_at DESC 
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        return {
          success: true,
        };
      }

      const lastMigration = result.rows[0]?.filename;

      logger.warn(`Rolling back migration: ${lastMigration}`);

      // Note: This is a basic rollback - in production you'd want to implement
      // proper rollback scripts for each migration
      console.log(
        "⚠️  Warning: Rollback functionality is basic and may not work for all migrations"
      );
      console.log(`⚠️  Last applied migration: ${lastMigration}`);
      console.log("⚠️  Manual rollback may be required");

      // Remove the migration record
      await this.db.query(
        `
        DELETE FROM migrations WHERE filename = $1
      `,
        [lastMigration]
      );

      logger.info(`Rolled back migration: ${lastMigration}`);

      return {
        success: true,
        rolledBackMigration: lastMigration || "No migration to rollback",
      };
    } catch (error) {
      const errorMsg = `Rollback failed: ${error}`;

      logger.error(errorMsg);

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Get migration history
   */
  async getHistory(): Promise<MigrationInfo[]> {
    try {
      const result = await this.db.query(`
        SELECT filename, applied_at, checksum, execution_time_ms 
        FROM migrations 
        ORDER BY applied_at DESC
      `);

      return result.rows.map((row: any) => ({
        filename: row.filename,
        path: join(this.migrationsDir, row.filename),
        checksum: row.checksum,
        appliedAt: new Date(row.applied_at),
        executionTimeMs: row.execution_time_ms,
      }));
    } catch (error) {
      logger.error("Failed to get migration history:", error);

      return [];
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.db.close();
  }
}
