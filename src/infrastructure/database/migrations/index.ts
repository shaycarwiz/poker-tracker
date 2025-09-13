// Database migrations index - Central export point for all migrations

export { MigrationRunner } from "./migration-runner";
export { MigrationRunner as MigrationRunnerClass } from "./migration-runner";

// Legacy migration list for backward compatibility
export const migrations = [
  "000_create_migrations_table.sql",
  "001_create_players_table.sql",
  "002_create_sessions_table.sql",
  "003_create_transactions_table.sql",
  "004_create_indexes_and_views.sql",
];

// Legacy runMigrations function for backward compatibility
export const runMigrations = async (): Promise<void> => {
  const { MigrationRunner } = await import("./migration-runner");
  const runner = new MigrationRunner();

  try {
    const result = await runner.runMigrations();

    if (!result.success) {
      throw new Error(`Migration failed: ${result.errors.join(", ")}`);
    }

    console.log("🎉 All migrations completed successfully");
  } finally {
    await runner.close();
  }
};
