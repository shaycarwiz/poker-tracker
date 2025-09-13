#!/usr/bin/env node

// CLI for running database migrations

import { MigrationRunner } from "./migration-runner";
import { logger } from "@/shared/utils/logger";

interface CliOptions {
  command: string;
  verbose?: boolean;
  help?: boolean;
}

class MigrationCLI {
  private runner: MigrationRunner;

  constructor() {
    this.runner = new MigrationRunner();
  }

  private parseArgs(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {
      command: args[0] || "help",
    };

    for (let i = 1; i < args.length; i++) {
      switch (args[i]) {
        case "--verbose":
        case "-v":
          options.verbose = true;
          break;
        case "--help":
        case "-h":
          options.help = true;
          break;
      }
    }

    return options;
  }

  private printHelp(): void {
    console.log(`
Database Migration CLI

Usage: npm run migrate [command] [options]

Commands:
  run         Run all pending migrations
  status      Show migration status
  rollback    Rollback the last applied migration
  history     Show migration history
  help        Show this help message

Options:
  --verbose, -v    Enable verbose logging
  --help, -h       Show help message

Examples:
  npm run migrate run
  npm run migrate status
  npm run migrate rollback
  npm run migrate history
  npm run migrate run --verbose
    `);
  }

  private async runMigrations(): Promise<void> {
    try {
      logger.info("Starting migration process...");
      const result = await this.runner.runMigrations();

      if (result.success) {
        console.log("\n✅ Migration completed successfully!");
        console.log(`📊 Applied: ${result.appliedMigrations.length}`);
        console.log(`⏭️  Skipped: ${result.skippedMigrations.length}`);
        console.log(`⏱️  Total time: ${result.totalTimeMs}ms`);

        if (result.appliedMigrations.length > 0) {
          console.log("\nApplied migrations:");
          result.appliedMigrations.forEach((filename) => {
            console.log(`  - ${filename}`);
          });
        }
      } else {
        console.log("\n❌ Migration failed!");
        console.log(`Errors: ${result.errors.length}`);
        result.errors.forEach((error) => {
          console.log(`  - ${error}`);
        });
        process.exit(1);
      }
    } catch (error) {
      logger.error("Migration process failed:", error);
      console.log(`\n❌ Migration failed: ${error}`);
      process.exit(1);
    }
  }

  private async showStatus(): Promise<void> {
    try {
      const status = await this.runner.getStatus();

      console.log("\n📊 Migration Status");
      console.log("==================");
      console.log(`Total migrations: ${status.total}`);
      console.log(`Applied: ${status.applied.length}`);
      console.log(`Pending: ${status.pending.length}`);

      if (status.applied.length > 0) {
        console.log("\n✅ Applied migrations:");
        status.applied.forEach((migration) => {
          const appliedAt = migration.appliedAt?.toISOString() || "Unknown";
          const executionTime = migration.executionTimeMs
            ? `${migration.executionTimeMs}ms`
            : "Unknown";
          console.log(
            `  - ${migration.filename} (${appliedAt}, ${executionTime})`
          );
        });
      }

      if (status.pending.length > 0) {
        console.log("\n⏳ Pending migrations:");
        status.pending.forEach((migration) => {
          console.log(`  - ${migration.filename}`);
        });
      }

      if (status.applied.length === status.total) {
        console.log("\n🎉 All migrations are up to date!");
      }
    } catch (error) {
      logger.error("Failed to get migration status:", error);
      console.log(`\n❌ Failed to get status: ${error}`);
      process.exit(1);
    }
  }

  private async rollbackLast(): Promise<void> {
    try {
      console.log("🔄 Rolling back last migration...");
      const result = await this.runner.rollbackLast();

      if (result.success) {
        if (result.rolledBackMigration) {
          console.log(
            `✅ Successfully rolled back: ${result.rolledBackMigration}`
          );
        } else {
          console.log("ℹ️  No migrations to rollback");
        }
      } else {
        console.log(`❌ Rollback failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      logger.error("Rollback failed:", error);
      console.log(`\n❌ Rollback failed: ${error}`);
      process.exit(1);
    }
  }

  private async showHistory(): Promise<void> {
    try {
      const history = await this.runner.getHistory();

      console.log("\n📜 Migration History");
      console.log("===================");

      if (history.length === 0) {
        console.log("No migration history found");
        return;
      }

      history.forEach((migration, index) => {
        const appliedAt = migration.appliedAt?.toISOString() || "Unknown";
        const executionTime = migration.executionTimeMs
          ? `${migration.executionTimeMs}ms`
          : "Unknown";
        console.log(`${index + 1}. ${migration.filename}`);
        console.log(`   Applied: ${appliedAt}`);
        console.log(`   Duration: ${executionTime}`);
        console.log(`   Checksum: ${migration.checksum.substring(0, 8)}...`);
        console.log("");
      });
    } catch (error) {
      logger.error("Failed to get migration history:", error);
      console.log(`\n❌ Failed to get history: ${error}`);
      process.exit(1);
    }
  }

  async run(): Promise<void> {
    const options = this.parseArgs();

    if (options.help || options.command === "help") {
      this.printHelp();
      return;
    }

    try {
      switch (options.command) {
        case "run":
          await this.runMigrations();
          break;
        case "status":
          await this.showStatus();
          break;
        case "rollback":
          await this.rollbackLast();
          break;
        case "history":
          await this.showHistory();
          break;
        default:
          console.log(`Unknown command: ${options.command}`);
          this.printHelp();
          process.exit(1);
      }
    } finally {
      await this.runner.close();
    }
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new MigrationCLI();
  cli.run().catch((error) => {
    logger.error("CLI execution failed:", error);
    console.log(`\n❌ CLI execution failed: ${error}`);
    process.exit(1);
  });
}

export { MigrationCLI };
