# Poker Tracker

A comprehensive poker tracking application built with Express.js and TypeScript, designed to help poker players track their games, analyze statistics, and improve their performance.

## Features

- 🎯 **Game Tracking**: Record poker sessions with detailed hand histories
- 📊 **Statistics & Analytics**: Comprehensive performance metrics and analysis
- 🏆 **Hand Rankings**: Advanced poker hand evaluation system
- 📈 **Progress Monitoring**: Track improvement over time
- 🔒 **Secure**: Built with security best practices
- 🚀 **Scalable**: Clean architecture for future growth

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

_More endpoints will be added as features are developed_

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
