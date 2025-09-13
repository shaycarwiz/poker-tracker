// Poker Tracker App - Domain-Driven Design Models

// ===== VALUE OBJECTS =====
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = "USD"
  ) {
    if (amount < 0) throw new Error("Money amount cannot be negative");
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

export class Stakes {
  constructor(
    public readonly smallBlind: Money,
    public readonly bigBlind: Money,
    public readonly ante?: Money
  ) {
    if (smallBlind.amount >= bigBlind.amount) {
      throw new Error("Small blind must be less than big blind");
    }
  }

  get formatted(): string {
    if (this.ante) {
      return `${this.smallBlind.amount}/${this.bigBlind.amount}/${this.ante.amount}`;
    }
    return `${this.smallBlind.amount}/${this.bigBlind.amount}`;
  }

  equals(other: Stakes): boolean {
    return (
      this.smallBlind.equals(other.smallBlind) &&
      this.bigBlind.equals(other.bigBlind) &&
      this.ante?.equals(other.ante || new Money(0)) === true
    );
  }
}

export class Duration {
  constructor(public readonly minutes: number) {
    if (minutes < 0) throw new Error("Duration cannot be negative");
  }

  get hours(): number {
    return this.minutes / 60;
  }

  add(other: Duration): Duration {
    return new Duration(this.minutes + other.minutes);
  }

  equals(other: Duration): boolean {
    return this.minutes === other.minutes;
  }
}

// ===== ENTITIES =====
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
    const minutes = Math.floor(
      (this._endTime.getTime() - this._startTime.getTime()) / (1000 * 60)
    );
    return new Duration(minutes);
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

// ===== ENUMS =====
export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TransactionType {
  BUY_IN = "buy_in",
  CASH_OUT = "cash_out",
  REBUY = "rebuy",
  ADD_ON = "add_on",
  TIP = "tip",
  RAKEBACK = "rakeback",
  BONUS = "bonus",
  OTHER = "other",
}

// ===== DOMAIN SERVICES =====
export class PlayerStatsService {
  calculateStats(player: Player, sessions: Session[]): PlayerStats {
    const completedSessions = sessions.filter(
      (s) => s.status === SessionStatus.COMPLETED
    );

    if (completedSessions.length === 0) {
      return new PlayerStats(
        player.id,
        player.name,
        0,
        new Duration(0),
        new Money(0),
        new Money(0),
        new Money(0),
        new Money(0),
        new Money(0),
        0,
        new Money(0),
        new Money(0),
        0,
        0,
        player.currentBankroll.amount,
        new Money(0)
      );
    }

    const totalBuyIn = completedSessions.reduce(
      (sum, s) => sum.add(s.totalBuyIn),
      new Money(0)
    );
    const totalCashOut = completedSessions.reduce(
      (sum, s) => sum.add(s.totalCashOut),
      new Money(0)
    );
    const netProfit = totalCashOut.subtract(totalBuyIn);
    const totalDuration = completedSessions.reduce((sum, s) => {
      const duration = s.duration;
      return duration ? sum.add(duration) : sum;
    }, new Duration(0));

    const winningSessions = completedSessions.filter(
      (s) => s.netResult.amount > 0
    );
    const winRate = (winningSessions.length / completedSessions.length) * 100;

    const hourlyRate =
      totalDuration.hours > 0
        ? new Money(netProfit.amount / totalDuration.hours, netProfit.currency)
        : new Money(0);

    const results = completedSessions.map((s) => s.netResult.amount);
    const biggestWin = new Money(Math.max(...results, 0), netProfit.currency);
    const biggestLoss = new Money(Math.min(...results, 0), netProfit.currency);

    const streak = this.calculateStreak(completedSessions);

    return new PlayerStats(
      player.id,
      player.name,
      completedSessions.length,
      totalDuration,
      totalBuyIn,
      totalCashOut,
      netProfit,
      biggestWin,
      biggestLoss,
      winRate,
      new Money(
        netProfit.amount / completedSessions.length,
        netProfit.currency
      ),
      hourlyRate,
      streak.best,
      streak.worst,
      streak.current,
      player.currentBankroll,
      completedSessions[completedSessions.length - 1]?.endTime
    );
  }

  private calculateStreak(sessions: Session[]): {
    best: number;
    worst: number;
    current: number;
  } {
    if (sessions.length === 0) return { best: 0, worst: 0, current: 0 };

    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let maxStreak = 0;
    let minStreak = 0;

    for (const session of sessions) {
      if (session.netResult.amount > 0) {
        currentStreak = Math.max(currentStreak, 0) + 1;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = Math.min(currentStreak, 0) - 1;
        minStreak = Math.min(minStreak, currentStreak);
      }
    }

    return {
      best: maxStreak,
      worst: Math.abs(minStreak),
      current: Math.abs(currentStreak),
    };
  }
}

// ===== AGGREGATE ROOTS =====
export class PlayerStats {
  constructor(
    public readonly playerId: PlayerId,
    public readonly playerName: string,
    public readonly totalSessions: number,
    public readonly totalDuration: Duration,
    public readonly totalBuyIn: Money,
    public readonly totalCashOut: Money,
    public readonly netProfit: Money,
    public readonly biggestWin: Money,
    public readonly biggestLoss: Money,
    public readonly winRate: number,
    public readonly averageSession: Money,
    public readonly hourlyRate: Money,
    public readonly bestStreak: number,
    public readonly worstStreak: number,
    public readonly currentStreak: number,
    public readonly currentBankroll: Money,
    public readonly lastSessionDate?: Date
  ) {}
}

export interface SessionSummary {
  sessionId: string;
  playerId: string;
  playerName: string;
  duration: number; // in minutes
  totalBuyIn: number;
  totalCashOut: number;
  netResult: number;
  hourlyRate: number;
  bigBlindsWon: number; // net result in big blinds
  location: string;
  stakes: string; // formatted as "1/2" or "2/5"
  date: string; // formatted date
}

// ===== DOMAIN EVENTS =====
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

// ===== UTILITY TYPES =====
export interface SessionFilters {
  playerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minBuyIn?: number;
  maxBuyIn?: number;
  status?: SessionStatus;
  location?: string;
  stakes?: string; // filter by stakes like "1/2", "2/5"
}

export interface TransactionFilters {
  sessionId?: string;
  playerId?: string;
  type?: TransactionType;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Helper types for common operations
export interface CreateSessionRequest {
  playerId: string;
  location: string;
  stakes: Stakes;
  startTime: Date;
  initialBuyIn: Money;
  notes?: string;
}

export interface EndSessionRequest {
  sessionId: string;
  endTime: Date;
  finalCashOut: Money;
  notes?: string;
}

export interface AddTransactionRequest {
  sessionId: string;
  playerId: string;
  type: TransactionType;
  amount: Money;
  description?: string;
  notes?: string;
}
