# Database Migrations

This directory contains the database migration system for the Poker Tracker application.

## Overview

The migration system provides:

- **Automatic tracking** of applied migrations
- **Checksum validation** to ensure migration integrity
- **CLI commands** for running and managing migrations
- **Rollback support** (basic implementation)
- **Status reporting** and history tracking

## Migration Files

Migration files should be named with a numeric prefix and descriptive name:

- `000_create_migrations_table.sql` - Creates the migration tracking table
- `001_create_players_table.sql` - Creates the players table
- `002_create_sessions_table.sql` - Creates the sessions table
- `003_create_transactions_table.sql` - Creates the transactions table
- `004_create_indexes_and_views.sql` - Creates indexes and views

## CLI Commands

### Run Migrations

```bash
# Run all pending migrations
npm run migrate run

# Run with verbose output
npm run migrate run --verbose
```

### Check Status

```bash
# Show migration status
npm run migrate status
```

### Rollback

```bash
# Rollback the last applied migration
npm run migrate rollback
```

### View History

```bash
# Show migration history
npm run migrate history
```

### Help

```bash
# Show help information
npm run migrate help
```

## Migration Tracking

The system automatically creates a `migrations` table to track:

- Migration filename
- Applied timestamp
- Checksum (SHA-256)
- Execution time

## Usage in Code

```typescript
import { MigrationRunner } from "./migrations/migration-runner";

const runner = new MigrationRunner();

// Run all pending migrations
const result = await runner.runMigrations();

// Check status
const status = await runner.getStatus();

// Get history
const history = await runner.getHistory();

// Rollback last migration
const rollbackResult = await runner.rollbackLast();

// Close connection
await runner.close();
```

## Best Practices

1. **Always test migrations** in a development environment first
2. **Use transactions** for complex migrations when possible
3. **Include rollback scripts** for production migrations
4. **Never modify applied migrations** - create new ones instead
5. **Use descriptive filenames** that explain what the migration does
6. **Test rollback procedures** before deploying to production

## Migration File Structure

Each migration file should:

- Be a valid SQL file
- Include comments explaining the purpose
- Use `IF NOT EXISTS` for table creation when appropriate
- Include proper indexes and constraints
- Be idempotent (safe to run multiple times)

## Error Handling

The migration system includes comprehensive error handling:

- Failed migrations are logged with detailed error messages
- Partial migrations are rolled back automatically
- Checksum validation prevents corrupted migrations from being applied
- Database connection errors are handled gracefully

## Development vs Production

- **Development**: Use `npm run migrate run` for quick iteration
- **Production**: Use `npm run migrate:build` to compile and run migrations
- **CI/CD**: Include migration status checks in deployment pipelines
