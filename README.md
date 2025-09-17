# Poker Tracker Monorepo

A comprehensive poker tracking application with a monorepo architecture.

## Structure

This monorepo contains:

- **`packages/api`** - Express.js REST API with comprehensive poker domain logic

## Quick Start

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
cp packages/api/env.example packages/api/.env
# Edit packages/api/.env with your configuration
```

4. Run database migrations:

```bash
npm run migrate:run
```

### Development

Start the API in development mode:

```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start API in development mode
- `npm run build` - Build the API
- `npm run start` - Start the production API
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - Run TypeScript type checking

## API Documentation

See the API package README for detailed documentation:
[packages/api/README.md](packages/api/README.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details
