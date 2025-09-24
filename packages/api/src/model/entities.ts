// Entities - Objects with identity that can change over time

import { Duration, Money, Stakes } from "./value-objects";
import { SessionStatus, TransactionType } from "./enums";
import {
  AggregateRoot,
  SessionEndedEvent,
  SessionStartedEvent,
  TransactionAddedEvent,
} from "./events";
import { ValidationError, BusinessError, API_ERROR_CODES } from "../shared";

// ID Value Objects
export class PlayerId {
  constructor(public readonly value: string) {
    if (!value)
      throw new ValidationError(API_ERROR_CODES.VALIDATION_PLAYER_ID_REQUIRED);
  }

  static generate(): PlayerId {
    return new PlayerId(crypto.randomUUID());
  }

  equals(other: PlayerId): boolean {
    return this.value === other.value;
  }
}

export class SessionId {
  constructor(public readonly value: string) {
    if (!value)
      throw new ValidationError(API_ERROR_CODES.VALIDATION_SESSION_ID_REQUIRED);
  }

  static generate(): SessionId {
    return new SessionId(crypto.randomUUID());
  }

  equals(other: SessionId): boolean {
    return this.value === other.value;
  }
}

export class TransactionId {
  constructor(public readonly value: string) {
    if (!value)
      throw new ValidationError(
        API_ERROR_CODES.VALIDATION_TRANSACTION_ID_REQUIRED
      );
  }

  static generate(): TransactionId {
    return new TransactionId(crypto.randomUUID());
  }

  equals(other: TransactionId): boolean {
    return this.value === other.value;
  }
}

// Main Entities
export class Player extends AggregateRoot {
  constructor(
    public readonly id: PlayerId,
    private _name: string,
    private _email?: string,
    private _googleId?: string,
    private _currentBankroll: Money = new Money(0),
    private _totalSessions: number = 0,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {
    super();
  }

  static create(name: string, email?: string, initialBankroll?: Money): Player {
    const id = PlayerId.generate();

    return new Player(
      id,
      name,
      email,
      undefined,
      initialBankroll || new Money(0)
    );
  }

  static createFromGoogle(
    googleId: string,
    name: string,
    email: string,
    initialBankroll?: Money
  ): Player {
    const id = PlayerId.generate();

    return new Player(
      id,
      name,
      email,
      googleId,
      initialBankroll || new Money(0)
    );
  }

  get name(): string {
    return this._name;
  }

  get email(): string | undefined {
    return this._email;
  }

  get googleId(): string | undefined {
    return this._googleId;
  }

  get currentBankroll(): Money {
    return this._currentBankroll;
  }

  get totalSessions(): number {
    return this._totalSessions;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateName(name: string): void {
    if (!name.trim())
      throw new ValidationError(API_ERROR_CODES.VALIDATION_NAME_REQUIRED);
    this._name = name.trim();
    this._updatedAt = new Date();
  }

  updateEmail(email: string): void {
    if (email && !this.isValidEmail(email)) {
      throw new ValidationError(API_ERROR_CODES.VALIDATION_EMAIL_INVALID);
    }
    this._email = email;
    this._updatedAt = new Date();
  }

  linkGoogleAccount(googleId: string): void {
    if (this._googleId) {
      throw new BusinessError(
        API_ERROR_CODES.AUTH_GOOGLE_ACCOUNT_ALREADY_LINKED
      );
    }
    this._googleId = googleId;
    this._updatedAt = new Date();
  }

  adjustBankroll(amount: Money): void {
    this._currentBankroll = this._currentBankroll.add(amount);
    this._updatedAt = new Date();
  }

  incrementSessionCount(): void {
    this._totalSessions++;
    this._updatedAt = new Date();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }
}

export class Session extends AggregateRoot {
  constructor(
    public readonly id: SessionId,
    public readonly playerId: PlayerId,
    private _location: string,
    private _stakes: Stakes,
    private _startTime: Date,
    private _endTime?: Date,
    private _status: SessionStatus = SessionStatus.ACTIVE,
    private _transactions: Transaction[] = [],
    private _notes?: string,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {
    super();
  }

  static start(
    playerId: PlayerId,
    location: string,
    stakes: Stakes,
    initialBuyIn: Money,
    notes?: string
  ): Session {
    const id = SessionId.generate();
    const session = new Session(id, playerId, location, stakes, new Date());

    // Add initial buy-in transaction
    session.addTransaction(
      TransactionType.BUY_IN,
      initialBuyIn,
      "Initial buy-in"
    );

    if (notes) {
      session._notes = notes;
    }

    // Add domain event to the session
    session.addDomainEvent(
      new SessionStartedEvent(
        session.id,
        session.playerId,
        session.location,
        session.stakes
      )
    );

    return session;
  }

  get location(): string {
    return this._location;
  }

  get stakes(): Stakes {
    return this._stakes;
  }

  get startTime(): Date {
    return this._startTime;
  }

  get endTime(): Date | undefined {
    return this._endTime;
  }

  get status(): SessionStatus {
    return this._status;
  }

  get transactions(): readonly Transaction[] {
    return [...this._transactions];
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get totalBuyIn(): Money {
    return this._transactions
      .filter(
        (t) =>
          t.type === TransactionType.BUY_IN || t.type === TransactionType.REBUY
      )
      .reduce(
        (sum, t) => sum.add(t.amount),
        new Money(0, this._stakes.bigBlind.currency)
      );
  }

  get totalCashOut(): Money {
    return this._transactions
      .filter((t) => t.type === TransactionType.CASH_OUT)
      .reduce(
        (sum, t) => sum.add(t.amount),
        new Money(0, this._stakes.bigBlind.currency)
      );
  }

  get netResult(): Money {
    return this.totalCashOut.subtract(this.totalBuyIn);
  }

  get duration(): Duration | undefined {
    if (!this._endTime) return undefined;
    const hours =
      (this._endTime.getTime() - this._startTime.getTime()) / (1000 * 60 * 60);

    return new Duration(hours);
  }

  get hourlyRate(): Money | undefined {
    const { duration } = this;

    if (!duration || duration.hours === 0) return undefined;

    return new Money(
      this.netResult.amount / duration.hours,
      this.netResult.currency
    );
  }

  get bigBlindsWon(): number {
    if (this._stakes.bigBlind.amount === 0) return 0;

    return this.netResult.amount / this._stakes.bigBlind.amount;
  }

  addTransaction(
    type: TransactionType,
    amount: Money,
    description?: string,
    notes?: string
  ): void {
    if (this._status !== SessionStatus.ACTIVE) {
      throw new BusinessError(
        API_ERROR_CODES.BUSINESS_CANNOT_ADD_TRANSACTION_INACTIVE
      );
    }

    const transaction = new Transaction(
      TransactionId.generate(),
      this.id,
      this.playerId,
      type,
      amount,
      new Date(),
      description,
      notes
    );

    this._transactions.push(transaction);
    this._updatedAt = new Date();

    // Add domain event to the session
    this.addDomainEvent(
      new TransactionAddedEvent(
        transaction.id,
        this.id,
        this.playerId,
        type,
        amount
      )
    );
  }

  end(finalCashOut: Money, notes?: string): void {
    if (this._status !== SessionStatus.ACTIVE) {
      throw new BusinessError(
        API_ERROR_CODES.BUSINESS_CANNOT_END_INACTIVE_SESSION
      );
    }

    // Add cash-out transaction before changing status
    if (finalCashOut.amount > 0) {
      this.addTransaction(
        TransactionType.CASH_OUT,
        finalCashOut,
        "Final cash out"
      );
    }

    this._endTime = new Date();
    this._status = SessionStatus.COMPLETED;

    if (notes) {
      this._notes = this._notes ? `${this._notes}\n${notes}` : notes;
    }

    this._updatedAt = new Date();

    // Add domain event to the session
    this.addDomainEvent(
      new SessionEndedEvent(
        this.id,
        this.playerId,
        this.netResult,
        this.duration || new Duration(0)
      )
    );
  }

  cancel(reason?: string): void {
    if (this._status !== SessionStatus.ACTIVE) {
      throw new BusinessError(
        API_ERROR_CODES.BUSINESS_CANNOT_CANCEL_INACTIVE_SESSION
      );
    }

    this._status = SessionStatus.CANCELLED;
    this._endTime = new Date();

    if (reason) {
      this._notes = this._notes
        ? `${this._notes}\nCancelled: ${reason}`
        : `Cancelled: ${reason}`;
    }

    this._updatedAt = new Date();
  }

  updateLocation(location: string): void {
    if (!location.trim())
      throw new ValidationError(API_ERROR_CODES.VALIDATION_LOCATION_REQUIRED);
    this._location = location.trim();
    this._updatedAt = new Date();
  }

  updateNotes(notes: string): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }
}

export class Transaction {
  constructor(
    public readonly id: TransactionId,
    public readonly sessionId: SessionId,
    public readonly playerId: PlayerId,
    public readonly type: TransactionType,
    public readonly amount: Money,
    public readonly timestamp: Date,
    public readonly description?: string,
    public readonly notes?: string
  ) {
    if (amount.amount <= 0) {
      throw new ValidationError(API_ERROR_CODES.VALIDATION_AMOUNT_POSITIVE);
    }
  }
}
