// Domain Events - Events that represent something important that happened in the domain

import { SessionId, PlayerId, TransactionId } from "./entities";
import { Money, Stakes, Duration } from "./value-objects";
import { TransactionType } from "./enums";
import logger from "@/shared/utils/logger";

export abstract class DomainEvent {
  constructor(
    public readonly occurredOn: Date = new Date(),
    public readonly eventId: string = crypto.randomUUID()
  ) {}
}

// Event handler type
export type EventHandler<T extends DomainEvent> = (
  event: T
) => void | Promise<void>;

// Base class for aggregate roots that can collect domain events
export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }
}
type DomainEventClass<T extends DomainEvent> = abstract new (
  ...args: never[]
) => T;

// Event dispatcher for managing and publishing domain events
export class DomainEventDispatcher {
  private static handlers: Map<string, EventHandler<any>[]> = new Map();
  private static isEnabled: boolean = true;

  static register<T extends DomainEvent>(
    eventType: DomainEventClass<T>,
    handler: EventHandler<T>
  ): void {
    const eventName = eventType.name;
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  static async publish(event: DomainEvent): Promise<void> {
    if (!this.isEnabled) return;

    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];

    // Execute all handlers for this event type
    const promises = handlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(`Error handling event ${eventName}:`, error);
        // Don't rethrow to prevent one handler failure from affecting others
      }
    });

    await Promise.all(promises);
  }

  static async publishAll(events: DomainEvent[]): Promise<void> {
    const promises = events.map((event) => this.publish(event));
    await Promise.all(promises);
  }

  static clearHandlers(): void {
    this.handlers.clear();
  }

  static enable(): void {
    this.isEnabled = true;
  }

  static disable(): void {
    this.isEnabled = false;
  }

  static getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length || 0;
  }
}

export class SessionStartedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: SessionId,
    public readonly playerId: PlayerId,
    public readonly location: string,
    public readonly stakes: Stakes
  ) {
    super();
  }
}

export class SessionEndedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: SessionId,
    public readonly playerId: PlayerId,
    public readonly netResult: Money,
    public readonly duration: Duration
  ) {
    super();
  }
}

export class TransactionAddedEvent extends DomainEvent {
  constructor(
    public readonly transactionId: TransactionId,
    public readonly sessionId: SessionId,
    public readonly playerId: PlayerId,
    public readonly type: TransactionType,
    public readonly amount: Money
  ) {
    super();
  }
}
