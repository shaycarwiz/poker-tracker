// Tests for domain events

import {
  DomainEventDispatcher,
  AggregateRoot,
  DomainEvent,
  SessionStartedEvent,
  SessionEndedEvent,
  TransactionAddedEvent,
} from "@/model/events";
import { SessionId, PlayerId, TransactionId } from "@/model/entities";
import { Money, Stakes, Duration } from "@/model/value-objects";
import { TransactionType } from "@/model/enums";

describe("Domain Events", () => {
  beforeEach(() => {
    DomainEventDispatcher.clearHandlers();
  });

  describe("AggregateRoot", () => {
    class TestAggregate extends AggregateRoot {
      public addTestEvent(event: DomainEvent): void {
        this.addDomainEvent(event);
      }
    }

    it("should collect events", () => {
      const aggregate = new TestAggregate();
      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const event = new SessionStartedEvent(
        sessionId,
        playerId,
        "Test Location",
        stakes
      );

      expect(aggregate.hasDomainEvents()).toBe(false);

      aggregate.addTestEvent(event);

      expect(aggregate.hasDomainEvents()).toBe(true);
      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBe(event);
    });

    it("should clear events", () => {
      const aggregate = new TestAggregate();
      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const event = new SessionStartedEvent(
        sessionId,
        playerId,
        "Test Location",
        stakes
      );

      aggregate.addTestEvent(event);
      expect(aggregate.hasDomainEvents()).toBe(true);

      aggregate.clearDomainEvents();
      expect(aggregate.hasDomainEvents()).toBe(false);
      expect(aggregate.domainEvents).toHaveLength(0);
    });
  });

  describe("DomainEventDispatcher", () => {
    it("should register and call event handlers", async () => {
      let handlerCalled = false;
      let receivedEvent: SessionStartedEvent | null = null;

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        (event: SessionStartedEvent) => {
          handlerCalled = true;
          receivedEvent = event;
        }
      );

      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const event = new SessionStartedEvent(
        sessionId,
        playerId,
        "Test Location",
        stakes
      );

      await DomainEventDispatcher.publish(event);

      expect(handlerCalled).toBe(true);
      expect(receivedEvent).toBe(event);
      expect(receivedEvent!.sessionId).toBe(sessionId);
      expect(receivedEvent!.playerId).toBe(playerId);
    });

    it("should handle multiple handlers for the same event type", async () => {
      let handler1Called = false;
      let handler2Called = false;

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {
          handler1Called = true;
        }
      );

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {
          handler2Called = true;
        }
      );

      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const event = new SessionStartedEvent(
        sessionId,
        playerId,
        "Test Location",
        stakes
      );

      await DomainEventDispatcher.publish(event);

      expect(handler1Called).toBe(true);
      expect(handler2Called).toBe(true);
    });

    it("should not call handlers when disabled", async () => {
      let handlerCalled = false;

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {
          handlerCalled = true;
        }
      );

      DomainEventDispatcher.disable();

      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const event = new SessionStartedEvent(
        sessionId,
        playerId,
        "Test Location",
        stakes
      );

      await DomainEventDispatcher.publish(event);

      expect(handlerCalled).toBe(false);

      DomainEventDispatcher.enable();
    });

    it("should handle handler errors gracefully", async () => {
      let handler2Called = false;

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {
          throw new Error("Handler error");
        }
      );

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {
          handler2Called = true;
        }
      );

      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const event = new SessionStartedEvent(
        sessionId,
        playerId,
        "Test Location",
        stakes
      );

      // Should not throw
      await expect(DomainEventDispatcher.publish(event)).resolves.not.toThrow();
      expect(handler2Called).toBe(true);
    });

    it("should return correct handler count", () => {
      expect(DomainEventDispatcher.getHandlerCount("SessionStartedEvent")).toBe(
        0
      );

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {}
      );

      expect(DomainEventDispatcher.getHandlerCount("SessionStartedEvent")).toBe(
        1
      );

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {}
      );

      expect(DomainEventDispatcher.getHandlerCount("SessionStartedEvent")).toBe(
        2
      );
    });

    it("should publish all events", async () => {
      let handler1Called = false;
      let handler2Called = false;

      DomainEventDispatcher.register<SessionStartedEvent>(
        SessionStartedEvent,
        () => {
          handler1Called = true;
        }
      );

      DomainEventDispatcher.register<SessionEndedEvent>(
        SessionEndedEvent,
        () => {
          handler2Called = true;
        }
      );

      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const netResult = new Money(100, "USD");
      const duration = new Duration(2.5);

      const events = [
        new SessionStartedEvent(sessionId, playerId, "Test Location", stakes),
        new SessionEndedEvent(sessionId, playerId, netResult, duration),
      ];

      await DomainEventDispatcher.publishAll(events);

      expect(handler1Called).toBe(true);
      expect(handler2Called).toBe(true);
    });
  });

  describe("Event Classes", () => {
    it("should create SessionStartedEvent with correct properties", () => {
      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const stakes = new Stakes(new Money(1, "USD"), new Money(2, "USD"));
      const event = new SessionStartedEvent(
        sessionId,
        playerId,
        "Test Location",
        stakes
      );

      expect(event.sessionId).toBe(sessionId);
      expect(event.playerId).toBe(playerId);
      expect(event.location).toBe("Test Location");
      expect(event.stakes).toBe(stakes);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it("should create SessionEndedEvent with correct properties", () => {
      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const netResult = new Money(100, "USD");
      const duration = new Duration(2.5);
      const event = new SessionEndedEvent(
        sessionId,
        playerId,
        netResult,
        duration
      );

      expect(event.sessionId).toBe(sessionId);
      expect(event.playerId).toBe(playerId);
      expect(event.netResult).toBe(netResult);
      expect(event.duration).toBe(duration);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it("should create TransactionAddedEvent with correct properties", () => {
      const transactionId = new TransactionId("test-transaction-id");
      const sessionId = new SessionId("test-session-id");
      const playerId = new PlayerId("test-player-id");
      const amount = new Money(50, "USD");
      const event = new TransactionAddedEvent(
        transactionId,
        sessionId,
        playerId,
        TransactionType.BUY_IN,
        amount
      );

      expect(event.transactionId).toBe(transactionId);
      expect(event.sessionId).toBe(sessionId);
      expect(event.playerId).toBe(playerId);
      expect(event.type).toBe(TransactionType.BUY_IN);
      expect(event.amount).toBe(amount);
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
    });
  });
});
