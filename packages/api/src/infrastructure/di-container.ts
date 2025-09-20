// Dependency Injection Container using tsyringe
import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";
import {
  PostgresPlayerRepository,
  PostgresSessionRepository,
  PostgresTransactionRepository,
  PostgresUnitOfWork,
} from "./database";
import { PlayerService, SessionService } from "@/application/services";
import { EventHandlers } from "@/application/handlers/event-handlers";
import { SessionEventHandlers } from "@/application/handlers/session-event-handlers";

// Register repositories as singletons
tsyringeContainer.registerSingleton(
  "PlayerRepository",
  PostgresPlayerRepository
);
tsyringeContainer.registerSingleton(
  "SessionRepository",
  PostgresSessionRepository
);
tsyringeContainer.registerSingleton(
  "TransactionRepository",
  PostgresTransactionRepository
);
tsyringeContainer.registerSingleton("UnitOfWork", PostgresUnitOfWork);

// Register services as singletons
tsyringeContainer.registerSingleton("PlayerService", PlayerService);
tsyringeContainer.registerSingleton("SessionService", SessionService);

// Initialize event handlers
const initializeEventHandlers = () => {
  EventHandlers.registerAll();
  SessionEventHandlers.register();
};

// Export the container with helper methods
export const diContainer = {
  // Get instance by token
  get: <T>(token: string): T => tsyringeContainer.resolve<T>(token),

  // Get instance by constructor
  getByConstructor: <T>(constructor: new (...args: any[]) => T): T =>
    tsyringeContainer.resolve<T>(constructor),

  // Initialize event handlers
  initializeEventHandlers,

  // Direct access to tsyringe container for advanced usage
  container: tsyringeContainer,
};

export type DIContainer = typeof diContainer;
