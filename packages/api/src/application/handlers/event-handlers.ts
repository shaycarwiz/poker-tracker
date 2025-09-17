// Event handlers - Handle domain events

import {
  DomainEventDispatcher,
  SessionEndedEvent,
  SessionStartedEvent,
  TransactionAddedEvent,
} from "@/model/events";
import { logger } from "@/shared/utils/logger";

export class EventHandlers {
  static registerAll(): void {
    // Register session started handler
    DomainEventDispatcher.register<SessionStartedEvent>(
      SessionStartedEvent,
      async (event) => {
        logger.info("Session started event received", {
          eventId: event.eventId,
          sessionId: event.sessionId.value,
          playerId: event.playerId.value,
          location: event.location,
          stakes: event.stakes.formatted,
          occurredOn: event.occurredOn,
        });

        // Add your business logic here:
        // - Send notifications
        // - Update analytics
        // - Log to audit trail
        // - Trigger external integrations
      },
    );

    // Register session ended handler
    DomainEventDispatcher.register<SessionEndedEvent>(
      SessionEndedEvent,
      async (event) => {
        logger.info("Session ended event received", {
          eventId: event.eventId,
          sessionId: event.sessionId.value,
          playerId: event.playerId.value,
          netResult: event.netResult.amount,
          duration: event.duration.hours,
          occurredOn: event.occurredOn,
        });

        // Add your business logic here:
        // - Calculate final statistics
        // - Update player performance metrics
        // - Send session summary notifications
        // - Trigger reporting updates
      },
    );

    // Register transaction added handler
    DomainEventDispatcher.register<TransactionAddedEvent>(
      TransactionAddedEvent,
      async (event) => {
        logger.info("Transaction added event received", {
          eventId: event.eventId,
          transactionId: event.transactionId.value,
          sessionId: event.sessionId.value,
          playerId: event.playerId.value,
          type: event.type,
          amount: event.amount.amount,
          occurredOn: event.occurredOn,
        });

        // Add your business logic here:
        // - Update real-time statistics
        // - Check for unusual transaction patterns
        // - Log transaction for compliance
        // - Update live session tracking
      },
    );

    logger.info("All event handlers registered successfully");
  }

  static getHandlerCounts(): Record<string, number> {
    return {
      SessionStartedEvent: DomainEventDispatcher.getHandlerCount(
        "SessionStartedEvent",
      ),
      SessionEndedEvent:
        DomainEventDispatcher.getHandlerCount("SessionEndedEvent"),
      TransactionAddedEvent: DomainEventDispatcher.getHandlerCount(
        "TransactionAddedEvent",
      ),
    };
  }
}
