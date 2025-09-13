// Domain Events - Events that represent something important that happened in the domain

import { SessionId, PlayerId, TransactionId } from "./entities";
import { Money, Stakes, Duration } from "./value-objects";
import { TransactionType } from "./enums";

export abstract class DomainEvent {
  constructor(
    public readonly occurredOn: Date = new Date(),
    public readonly eventId: string = crypto.randomUUID()
  ) {}
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
