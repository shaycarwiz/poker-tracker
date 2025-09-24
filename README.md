# Poker Tracker Monorepo

A comprehensive poker tracking application with a monorepo architecture.

## Structure

This monorepo contains:

- **`packages/api`** - Express.js REST API with comprehensive poker domain logic
- **`packages/web`** - Next.js web application for poker session tracking and analytics

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
# API environment
cp packages/api/env.example packages/api/.env
# Edit packages/api/.env with your configuration

# Web environment
cp packages/web/env.example packages/web/.env.local
# Edit packages/web/.env.local with your configuration
```

4. Run database migrations:

```bash
npm run migrate:run
```

### Development

Start both API and web application:

```bash
# Start both API and web app
npm run dev:all

# Or start them separately
npm run dev          # API only
npm run dev:web      # Web app only
```

### Available Scripts

- `npm run dev` - Start API in development mode
- `npm run dev:web` - Start web app in development mode
- `npm run dev:all` - Start both API and web app
- `npm run build` - Build both API and web app
- `npm run start` - Start the production API
- `npm run start:web` - Start the production web app
- `npm run test` - Run tests for both packages
- `npm run lint` - Lint code for both packages
- `npm run type-check` - Run TypeScript type checking for both packages

## Documentation

- **API Documentation**: [packages/api/README.md](packages/api/README.md)
- **Web Application**: [packages/web/README.md](packages/web/README.md)
- **API Endpoints**: Available at `http://localhost:3000/docs` when running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details
