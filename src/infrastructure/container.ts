// Dependency injection container - Wires up all dependencies

import {
  PostgresPlayerRepository,
  PostgresSessionRepository,
  PostgresTransactionRepository,
  PostgresUnitOfWork,
} from "./database";
import { PlayerService, SessionService } from "@/application/services";
import { EventHandlers } from "@/application/handlers/event-handlers";
import { SessionEventHandlers } from "@/application/handlers/session-event-handlers";

// Create singleton instances
const playerRepository = new PostgresPlayerRepository();
const sessionRepository = new PostgresSessionRepository();
const transactionRepository = new PostgresTransactionRepository();
const unitOfWork = new PostgresUnitOfWork();

// Create application services
const playerService = new PlayerService(unitOfWork);
const sessionService = new SessionService(unitOfWork);

// Initialize event handlers
const initializeEventHandlers = () => {
  EventHandlers.registerAll();
  SessionEventHandlers.register();
};

// Export the container
export const container = {
  // Repositories
  repositories: {
    players: playerRepository,
    sessions: sessionRepository,
    transactions: transactionRepository,
  },

  // Unit of Work
  unitOfWork,

  // Application Services
  services: {
    players: playerService,
    sessions: sessionService,
  },

  // Event System
  initializeEventHandlers,
};

export type Container = typeof container;
