# Poker Tracker

A comprehensive poker tracking application built with Express.js and TypeScript, featuring a complete domain model and data persistence layer. The application is designed to help poker players track their games, analyze statistics, and improve their performance through a clean, scalable architecture.

## Features

- 🏗️ **Core Domain Model**: Complete poker domain entities and business logic
- 🗄️ **Data Persistence**: Full database layer with migrations and repositories
- 🔧 **Application Services**: Business logic services for players and sessions
- 🔒 **Secure**: Built with security best practices
- 🚀 **Scalable**: Clean architecture for future growth

### In Development

- 🎯 **Game Tracking API**: REST endpoints for session management
- 📊 **Statistics & Analytics**: Performance metrics and analysis
- 🏆 **Hand Rankings**: Advanced poker hand evaluation system
- 📈 **Progress Monitoring**: Track improvement over time

## Tech Stack

- **Backend**: Express.js with TypeScript
- **Architecture**: Clean Architecture with Domain-Driven Design
- **Testing**: Jest with comprehensive test coverage
- **Logging**: Winston for structured logging
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Project Structure

```
src/
├── api/                    # API layer
│   ├── controllers/        # Express route handlers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # Route definitions
│   └── validators/        # Request validation schemas
├── application/            # Application services & use cases
│   ├── services/          # Application services
│   ├── use-cases/         # Business use cases
│   └── dto/               # Data Transfer Objects
├── infrastructure/         # External concerns
│   ├── database/          # Database implementations
│   ├── external/          # External service integrations
│   └── config/            # Configuration management
├── model/                 # Domain layer
│   ├── aggregates.ts      # Domain aggregates
│   ├── entities.ts        # Domain entities
│   ├── value-objects.ts   # Value objects
│   └── ...               # Other domain files
└── shared/                # Shared utilities
    ├── errors/            # Custom error classes
    ├── utils/             # Utility functions
    └── constants/         # Application constants
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd poker-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Coming Soon

The following endpoints are planned but not yet implemented:

- **Player Management**

  - `POST /api/v1/players` - Create a new player
  - `GET /api/v1/players/:id` - Get player details
  - `PUT /api/v1/players/:id` - Update player information
  - `GET /api/v1/players` - List all players

- **Session Tracking**

  - `POST /api/v1/sessions` - Start a new poker session
  - `GET /api/v1/sessions/:id` - Get session details
  - `PUT /api/v1/sessions/:id/end` - End a session
  - `POST /api/v1/sessions/:id/transactions` - Add transaction to session
  - `GET /api/v1/sessions` - List sessions with filtering

- **Statistics & Analytics**
  - `GET /api/v1/players/:id/stats` - Get player statistics
  - `GET /api/v1/analytics/summary` - Get overall analytics
  - `GET /api/v1/analytics/trends` - Get performance trends

## Current Implementation Status

### ✅ Implemented Features

- **Domain Model**: Complete implementation of poker domain entities

  - `Player` entity with bankroll management
  - `Session` entity with transaction tracking
  - `Transaction` entity for buy-ins, rebuys, and cash-outs
  - Value objects: `Money`, `Stakes`, `Duration`
  - Domain services for statistics calculation

- **Data Access Layer**: Full database implementation

  - Repository pattern with interfaces
  - Unit of Work pattern for transactions
  - PostgreSQL adapter with connection pooling
  - Database migrations system
  - Data mappers for domain objects

- **Application Services**: Business logic layer

  - `PlayerService` for player management
  - `SessionService` for session tracking
  - Comprehensive error handling and logging

- **Infrastructure**: Production-ready setup
  - Express.js server with security middleware
  - Winston logging with file rotation
  - Environment configuration
  - Comprehensive test suite

### 🚧 In Progress

- **API Layer**: REST endpoints for external access
- **Hand Ranking System**: Poker hand evaluation
- **Analytics Engine**: Performance metrics calculation

### 📋 Planned Features

- **Web Interface**: Frontend for easy interaction
- **Real-time Updates**: WebSocket support for live tracking
- **Export/Import**: Data portability features
- **Advanced Analytics**: Machine learning insights

## Using the Application Services

While the API endpoints are not yet implemented, you can use the application services directly:

```typescript
import { container } from "@/infrastructure";
import { Money, Stakes } from "@/model/value-objects";
import { TransactionType } from "@/model/enums";

// Create a player
const player = await container.services.players.createPlayer(
  "John Doe",
  "john@example.com",
  new Money(1000, "USD")
);

// Start a session
const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
const session = await container.services.sessions.startSession(
  player.id,
  "Casino Royale",
  stakes,
  new Money(200, "USD"),
  "Friday night game"
);

// Add transactions
await container.services.sessions.addTransaction(
  session.id,
  TransactionType.REBUY,
  new Money(100, "USD"),
  "Rebuy after losing big pot"
);

// End session
await container.services.sessions.endSession(
  session.id,
  new Money(350, "USD"),
  "Great session, up $150!"
);
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **`players`**: Player information and basic statistics
- **`sessions`**: Poker session data with stakes and timing
- **`transactions`**: All financial transactions within sessions
- **`migrations`**: Migration tracking table

The database includes:

- Proper indexes for performance
- Foreign key constraints for data integrity
- Views for pre-calculated statistics
- Migration system for schema evolution

See [Database Documentation](src/infrastructure/database/README.md) for detailed information.

## Development

### Commit Convention

This project follows a structured commit message pattern:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore, ci, build
**Scopes**: poker, tracker, ui, api, db, config, deps

### Testing

Run tests with:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Code Quality

The project uses ESLint for code quality. Run linting:

```bash
npm run lint
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details
