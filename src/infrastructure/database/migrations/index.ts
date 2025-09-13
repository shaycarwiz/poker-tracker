// Database migrations index - Central export point for all migrations

export const migrations = [
  "001_create_players_table.sql",
  "002_create_sessions_table.sql",
  "003_create_transactions_table.sql",
  "004_create_indexes_and_views.sql",
];

export const runMigrations = async (): Promise<void> => {
  const { DatabaseConnection } = await import("../connection");
  const db = DatabaseConnection.getInstance();

  try {
    // Run each migration in order
    for (const migration of migrations) {
      const fs = await import("fs");
      const path = await import("path");
      const migrationPath = path.join(__dirname, migration);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      await db.query(migrationSQL);
      console.log(`✅ Migration ${migration} completed`);
    }

    console.log("🎉 All migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
};
