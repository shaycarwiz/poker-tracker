# Data Access Layer

This directory contains the data access layer implementation for the poker tracker application, following Domain-Driven Design (DDD) principles.

## Architecture Overview

The data access layer is structured as follows:

```
src/infrastructure/database/
├── connection.ts          # Database connection management
├── mappers/               # Data mappers for domain objects
│   ├── player-mapper.ts
│   ├── session-mapper.ts
│   ├── transaction-mapper.ts
│   └── index.ts
├── repositories/          # Repository implementations
│   ├── player-repository.ts
│   ├── session-repository.ts
│   ├── transaction-repository.ts
│   └── index.ts
├── migrations/            # Database schema migrations
│   ├── 001_create_players_table.sql
│   ├── 002_create_sessions_table.sql
│   ├── 003_create_transactions_table.sql
│   ├── 004_create_indexes_and_views.sql
│   └── index.ts
├── unit-of-work.ts        # Unit of Work pattern implementation
└── index.ts              # Central export point
```

## Key Components

### 1. Repository Pattern

The repository pattern abstracts data access behind interfaces defined in the domain layer:

- **`PlayerRepository`**: Manages player data
- **`SessionRepository`**: Manages poker session data
- **`TransactionRepository`**: Manages financial transaction data

### 2. Data Mappers

Data mappers convert between domain objects and database rows:

- **`PlayerMapper`**: Converts between `Player` entities and database rows
- **`SessionMapper`**: Converts between `Session` entities and database rows
- **`TransactionMapper`**: Converts between `Transaction` entities and database rows

### 3. Unit of Work

The Unit of Work pattern manages database transactions across multiple repositories:

```typescript
const unitOfWork = new PostgresUnitOfWork();

await unitOfWork.begin();
try {
  // Perform multiple operations
  await unitOfWork.players.save(player);
  await unitOfWork.sessions.save(session);
  await unitOfWork.commit();
} catch (error) {
  await unitOfWork.rollback();
  throw error;
}
```

### 4. Database Migrations

Database migrations are stored as SQL files and can be run programmatically:

```typescript
import { runMigrations } from "./migrations";

// Run all migrations
await runMigrations();
```

## Usage Examples

### Creating a Player

```typescript
import { container } from "@/infrastructure";

const playerService = container.services.players;

// Create a new player
const player = await playerService.createPlayer(
  "John Doe",
  "john@example.com",
  new Money(1000, "USD")
);
```

### Starting a Session

```typescript
import { container } from "@/infrastructure";
import { Money, Stakes } from "@/model/value-objects";

const sessionService = container.services.sessions;

// Start a new poker session
const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));

const session = await sessionService.startSession(
  playerId,
  "Casino Royale",
  stakes,
  new Money(200, "USD"),
  "Friday night game"
);
```

### Adding Transactions

```typescript
// Add a rebuy transaction
await sessionService.addTransaction(
  sessionId,
  TransactionType.REBUY,
  new Money(100, "USD"),
  "Rebuy after losing big pot"
);
```

### Ending a Session

```typescript
// End the session with final cash out
await sessionService.endSession(
  sessionId,
  new Money(350, "USD"),
  "Great session, up $150!"
);
```

## Database Schema

The database schema includes:

- **`players`**: Player information and basic statistics
- **`sessions`**: Poker session data with stakes and timing
- **`transactions`**: All financial transactions within sessions
- **Views**: Pre-calculated session summaries and player statistics

## Configuration

Database configuration is managed through environment variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=poker_tracker
DB_USERNAME=postgres
DB_PASSWORD=password
DB_SSL=false
```

## Error Handling

All repository methods include comprehensive error handling and logging:

- Database connection errors
- Constraint violations
- Transaction rollback on errors
- Detailed error logging for debugging

## Performance Considerations

- Connection pooling for efficient database connections
- Indexes on frequently queried columns
- Pre-calculated views for complex aggregations
- Batch operations where possible

## Testing

The repository pattern makes it easy to create mock implementations for unit testing:

```typescript
class MockPlayerRepository implements PlayerRepository {
  // Mock implementation for testing
}
```
