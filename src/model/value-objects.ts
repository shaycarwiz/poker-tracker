// Value Objects - Immutable objects that represent concepts by their value

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
