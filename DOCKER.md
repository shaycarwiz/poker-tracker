# Docker Development Setup

This document explains how to set up and use Docker for local development with PostgreSQL and pgAdmin.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Copy the environment file:**

   ```bash
   cp docker.env.example .env.docker
   ```

2. **Start the services:**

   ```bash
   docker-compose up -d
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

## Services

### PostgreSQL Database

- **Container:** `poker-tracker-postgres`
- **Port:** 5432 (configurable via `DB_PORT`)
- **Database:** `poker_tracker`
- **Username:** `postgres`
- **Password:** `postgres123` (configurable via `DB_PASSWORD`)

### pgAdmin

- **Container:** `poker-tracker-pgadmin`
- **Port:** 5050 (configurable via `PGADMIN_PORT`)
- **Email:** `admin@poker-tracker.com`
- **Password:** `admin123` (configurable via `PGADMIN_PASSWORD`)

## Connecting to Services

### From Your Application

Update your `packages/api/.env` file to use the Docker database:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=poker_tracker
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_SSL=false
```

### From pgAdmin

1. Open http://localhost:5050 in your browser
2. Login with the credentials from your `.env.docker` file
3. Add a new server connection:
   - **Host:** `postgres` (container name)
   - **Port:** `5432`
   - **Database:** `poker_tracker`
   - **Username:** `postgres`
   - **Password:** `postgres123`

## Common Commands

### Start services

```bash
docker-compose up -d
```

### Stop services

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs postgres
docker-compose logs pgadmin
```

### Restart services

```bash
docker-compose restart
```

### Remove everything (including data)

```bash
docker-compose down -v
```

## Data Persistence

- PostgreSQL data is persisted in the `postgres_data` Docker volume
- pgAdmin settings are persisted in the `pgadmin_data` Docker volume
- Data survives container restarts and updates

## Troubleshooting

### Port Conflicts

If you get port conflicts, update the ports in your `.env.docker` file:

```env
DB_PORT=5433
PGADMIN_PORT=8081
```

### Database Connection Issues

1. Ensure the PostgreSQL container is healthy:
   ```bash
   docker-compose ps
   ```
2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

### Reset Everything

To start fresh with a clean database:

```bash
docker-compose down -v
docker-compose up -d
```

## Development Workflow

1. Start Docker services: `docker-compose up -d`
2. Run database migrations: `cd packages/api && npm run migrate:run`
3. Start your API: `cd packages/api && npm run dev`
4. Start your web app: `cd packages/web && npm run dev`
5. Access pgAdmin at http://localhost:5050 for database management

## Environment Variables

All Docker-related environment variables are defined in `docker.env.example`. Copy this file to `.env.docker` and modify as needed.

| Variable           | Default                   | Description                |
| ------------------ | ------------------------- | -------------------------- |
| `DB_NAME`          | `poker_tracker`           | PostgreSQL database name   |
| `DB_USERNAME`      | `postgres`                | PostgreSQL username        |
| `DB_PASSWORD`      | `postgres123`             | PostgreSQL password        |
| `DB_PORT`          | `5432`                    | PostgreSQL port            |
| `PGADMIN_EMAIL`    | `admin@poker-tracker.com` | pgAdmin login email        |
| `PGADMIN_PASSWORD` | `admin123`                | pgAdmin login password     |
| `PGADMIN_PORT`     | `5050`                    | pgAdmin web interface port |
