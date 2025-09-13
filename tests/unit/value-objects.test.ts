import { Money, Stakes, Duration } from "@/model/value-objects";

describe("Money Value Object", () => {
  describe("constructor", () => {
    it("should create money with valid amount and currency", () => {
      const money = new Money(100.5, "USD");
      expect(money.amount).toBe(100.5);
      expect(money.currency).toBe("USD");
    });

    it("should default to USD currency when not specified", () => {
      const money = new Money(50);
      expect(money.currency).toBe("USD");
    });

    it("should throw error for negative amount", () => {
      expect(() => new Money(-10)).toThrow("Money amount cannot be negative");
    });

    it("should allow zero amount", () => {
      const money = new Money(0);
      expect(money.amount).toBe(0);
    });
  });

  describe("add", () => {
    it("should add money with same currency", () => {
      const money1 = new Money(100, "USD");
      const money2 = new Money(50, "USD");
      const result = money1.add(money2);

      expect(result.amount).toBe(150);
      expect(result.currency).toBe("USD");
    });

    it("should throw error when adding different currencies", () => {
      const money1 = new Money(100, "USD");
      const money2 = new Money(50, "EUR");

      expect(() => money1.add(money2)).toThrow(
        "Cannot add money with different currencies"
      );
    });
  });

  describe("subtract", () => {
    it("should subtract money with same currency", () => {
      const money1 = new Money(100, "USD");
      const money2 = new Money(30, "USD");
      const result = money1.subtract(money2);

      expect(result.amount).toBe(70);
      expect(result.currency).toBe("USD");
    });

    it("should throw error when subtracting different currencies", () => {
      const money1 = new Money(100, "USD");
      const money2 = new Money(30, "EUR");

      expect(() => money1.subtract(money2)).toThrow(
        "Cannot subtract money with different currencies"
      );
    });
  });

  describe("multiply", () => {
    it("should multiply amount by factor", () => {
      const money = new Money(100, "USD");
      const result = money.multiply(2.5);

      expect(result.amount).toBe(250);
      expect(result.currency).toBe("USD");
    });

    it("should handle decimal factors", () => {
      const money = new Money(100, "USD");
      const result = money.multiply(0.5);

      expect(result.amount).toBe(50);
    });
  });

  describe("equals", () => {
    it("should return true for equal money objects", () => {
      const money1 = new Money(100, "USD");
      const money2 = new Money(100, "USD");

      expect(money1.equals(money2)).toBe(true);
    });

    it("should return false for different amounts", () => {
      const money1 = new Money(100, "USD");
      const money2 = new Money(50, "USD");

      expect(money1.equals(money2)).toBe(false);
    });

    it("should return false for different currencies", () => {
      const money1 = new Money(100, "USD");
      const money2 = new Money(100, "EUR");

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should format money correctly", () => {
      const money = new Money(123.45, "USD");
      expect(money.toString()).toBe("USD 123.45");
    });

    it("should format money with two decimal places", () => {
      const money = new Money(100, "EUR");
      expect(money.toString()).toBe("EUR 100.00");
    });
  });
});

describe("Stakes Value Object", () => {
  describe("constructor", () => {
    it("should create stakes with valid blinds", () => {
      const smallBlind = new Money(1, "USD");
      const bigBlind = new Money(2, "USD");
      const stakes = new Stakes(smallBlind, bigBlind);

      expect(stakes.smallBlind).toBe(smallBlind);
      expect(stakes.bigBlind).toBe(bigBlind);
      expect(stakes.ante).toBeUndefined();
    });

    it("should create stakes with ante", () => {
      const smallBlind = new Money(1, "USD");
      const bigBlind = new Money(2, "USD");
      const ante = new Money(0.5, "USD");
      const stakes = new Stakes(smallBlind, bigBlind, ante);

      expect(stakes.ante).toBe(ante);
    });

    it("should throw error when small blind is not less than big blind", () => {
      const smallBlind = new Money(2, "USD");
      const bigBlind = new Money(2, "USD");

      expect(() => new Stakes(smallBlind, bigBlind)).toThrow(
        "Small blind must be less than big blind"
      );
    });

    it("should throw error when small blind is greater than big blind", () => {
      const smallBlind = new Money(3, "USD");
      const bigBlind = new Money(2, "USD");

      expect(() => new Stakes(smallBlind, bigBlind)).toThrow(
        "Small blind must be less than big blind"
      );
    });
  });

  describe("formatted", () => {
    it("should format stakes without ante", () => {
      const smallBlind = new Money(1, "USD");
      const bigBlind = new Money(2, "USD");
      const stakes = new Stakes(smallBlind, bigBlind);

      expect(stakes.formatted).toBe("$1/$2");
    });

    it("should format stakes with ante", () => {
      const smallBlind = new Money(1, "USD");
      const bigBlind = new Money(2, "USD");
      const ante = new Money(0.5, "USD");
      const stakes = new Stakes(smallBlind, bigBlind, ante);

      expect(stakes.formatted).toBe("$1/$2 ($0.50 ante)");
    });
  });
});

describe("Duration Value Object", () => {
  describe("constructor", () => {
    it("should create duration with hours", () => {
      const duration = new Duration(2.5);
      expect(duration.hours).toBe(2.5);
    });

    it("should allow zero duration", () => {
      const duration = new Duration(0);
      expect(duration.hours).toBe(0);
    });

    it("should throw error for negative duration", () => {
      expect(() => new Duration(-1)).toThrow("Duration cannot be negative");
    });
  });

  describe("add", () => {
    it("should add two durations", () => {
      const duration1 = new Duration(2);
      const duration2 = new Duration(1.5);
      const result = duration1.add(duration2);

      expect(result.hours).toBe(3.5);
    });
  });

  describe("formatted", () => {
    it("should format duration in hours and minutes", () => {
      const duration = new Duration(2.5);
      expect(duration.formatted).toBe("2h 30m");
    });

    it("should format duration with only hours", () => {
      const duration = new Duration(2);
      expect(duration.formatted).toBe("2h 0m");
    });

    it("should format duration with only minutes", () => {
      const duration = new Duration(0.5);
      expect(duration.formatted).toBe("0h 30m");
    });
  });
});
