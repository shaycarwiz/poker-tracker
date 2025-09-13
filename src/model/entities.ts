// Entities - Objects with identity that can change over time

import { Money, Stakes, Duration } from "./value-objects";
import { SessionStatus, TransactionType } from "./enums";

// ID Value Objects
export class PlayerId {
  constructor(public readonly value: string) {
    if (!value) throw new Error("PlayerId cannot be empty");
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
    if (!value) throw new Error("SessionId cannot be empty");
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
    if (!value) throw new Error("TransactionId cannot be empty");
  }

  static generate(): TransactionId {
    return new TransactionId(crypto.randomUUID());
  }

  equals(other: TransactionId): boolean {
    return this.value === other.value;
  }
}

// Main Entities
export class Player {
  private constructor(
    public readonly id: PlayerId,
    private _name: string,
    private _email?: string,
    private _currentBankroll: Money = new Money(0),
    private _totalSessions: number = 0,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  static create(name: string, email?: string, initialBankroll?: Money): Player {
    const id = PlayerId.generate();
    return new Player(id, name, email, initialBankroll || new Money(0));
  }

  get name(): string {
    return this._name;
  }

  get email(): string | undefined {
    return this._email;
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
    if (!name.trim()) throw new Error("Player name cannot be empty");
    this._name = name.trim();
    this._updatedAt = new Date();
  }

  updateEmail(email: string): void {
    if (email && !this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }
    this._email = email;
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

export class Session {
  private constructor(
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
  ) {}

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
      .reduce((sum, t) => sum.add(t.amount), new Money(0));
  }

  get totalCashOut(): Money {
    return this._transactions
      .filter((t) => t.type === TransactionType.CASH_OUT)
      .reduce((sum, t) => sum.add(t.amount), new Money(0));
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
    const duration = this.duration;
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
      throw new Error("Cannot add transactions to inactive session");
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
  }

  end(finalCashOut: Money, notes?: string): void {
    if (this._status !== SessionStatus.ACTIVE) {
      throw new Error("Cannot end inactive session");
    }

    this._endTime = new Date();
    this._status = SessionStatus.COMPLETED;

    if (finalCashOut.amount > 0) {
      this.addTransaction(
        TransactionType.CASH_OUT,
        finalCashOut,
        "Final cash out"
      );
    }

    if (notes) {
      this._notes = this._notes ? `${this._notes}\n${notes}` : notes;
    }

    this._updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (this._status !== SessionStatus.ACTIVE) {
      throw new Error("Cannot cancel inactive session");
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
    if (!location.trim()) throw new Error("Location cannot be empty");
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
      throw new Error("Transaction amount must be positive");
    }
  }
}
