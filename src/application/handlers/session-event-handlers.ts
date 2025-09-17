// Session-specific event handlers

import {
  DomainEventDispatcher,
  SessionEndedEvent,
  SessionStartedEvent,
  TransactionAddedEvent,
} from "@/model/events";
import { logger } from "@/shared/utils/logger";

export class SessionEventHandlers {
  static register(): void {
    // Handler for session started events
    DomainEventDispatcher.register<SessionStartedEvent>(
      SessionStartedEvent,
      async (event) => {
        await this.handleSessionStarted(event);
      },
    );

    // Handler for session ended events
    DomainEventDispatcher.register<SessionEndedEvent>(
      SessionEndedEvent,
      async (event) => {
        await this.handleSessionEnded(event);
      },
    );

    // Handler for transaction added events
    DomainEventDispatcher.register<TransactionAddedEvent>(
      TransactionAddedEvent,
      async (event) => {
        await this.handleTransactionAdded(event);
      },
    );

    logger.info("Session event handlers registered");
  }

  private static async handleSessionStarted(
    event: SessionStartedEvent,
  ): Promise<void> {
    logger.info("Processing session started event", {
      sessionId: event.sessionId.value,
      playerId: event.playerId.value,
      location: event.location,
      stakes: event.stakes.formatted,
    });

    // Business logic for session started:
    // - Update player's active session count
    // - Log session start for audit trail
    // - Send notification to player (if configured)
    // - Update real-time dashboard metrics

    // Example: Log to audit trail
    logger.info("AUDIT: Session started", {
      sessionId: event.sessionId.value,
      playerId: event.playerId.value,
      timestamp: event.occurredOn,
      eventId: event.eventId,
    });
  }

  private static async handleSessionEnded(
    event: SessionEndedEvent,
  ): Promise<void> {
    logger.info("Processing session ended event", {
      sessionId: event.sessionId.value,
      playerId: event.playerId.value,
      netResult: event.netResult.amount,
      duration: event.duration.hours,
    });

    // Business logic for session ended:
    // - Calculate session statistics
    // - Update player performance metrics
    // - Send session summary notification
    // - Update analytics dashboard
    // - Check for unusual patterns (big wins/losses)

    // Example: Log session summary
    const isProfit = event.netResult.amount > 0;
    const isLoss = event.netResult.amount < 0;

    logger.info("AUDIT: Session ended", {
      sessionId: event.sessionId.value,
      playerId: event.playerId.value,
      result: isProfit ? "PROFIT" : isLoss ? "LOSS" : "BREAKEVEN",
      netResult: event.netResult.amount,
      duration: event.duration.hours,
      timestamp: event.occurredOn,
      eventId: event.eventId,
    });

    // Example: Check for unusual patterns
    if (Math.abs(event.netResult.amount) > 1000) {
      // Large win/loss threshold
      logger.warn("Large session result detected", {
        sessionId: event.sessionId.value,
        playerId: event.playerId.value,
        amount: event.netResult.amount,
        type: isProfit ? "LARGE_WIN" : "LARGE_LOSS",
      });
    }
  }

  private static async handleTransactionAdded(
    event: TransactionAddedEvent,
  ): Promise<void> {
    logger.info("Processing transaction added event", {
      transactionId: event.transactionId.value,
      sessionId: event.sessionId.value,
      playerId: event.playerId.value,
      type: event.type,
      amount: event.amount.amount,
    });

    // Business logic for transaction added:
    // - Update real-time session tracking
    // - Check for unusual transaction patterns
    // - Log transaction for compliance
    // - Update live statistics

    // Example: Log transaction for compliance
    logger.info("AUDIT: Transaction added", {
      transactionId: event.transactionId.value,
      sessionId: event.sessionId.value,
      playerId: event.playerId.value,
      type: event.type,
      amount: event.amount.amount,
      timestamp: event.occurredOn,
      eventId: event.eventId,
    });

    // Example: Check for unusual patterns
    if (event.amount.amount > 500) {
      // Large transaction threshold
      logger.warn("Large transaction detected", {
        transactionId: event.transactionId.value,
        sessionId: event.sessionId.value,
        playerId: event.playerId.value,
        type: event.type,
        amount: event.amount.amount,
      });
    }
  }
}
