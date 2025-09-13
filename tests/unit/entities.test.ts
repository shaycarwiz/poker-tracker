import { Player, PlayerId, SessionId, TransactionId } from "@/model/entities";
import { Money } from "@/model/value-objects";

describe("ID Value Objects", () => {
  describe("PlayerId", () => {
    it("should create PlayerId with valid value", () => {
      const id = new PlayerId("test-id");
      expect(id.value).toBe("test-id");
    });

    it("should throw error for empty value", () => {
      expect(() => new PlayerId("")).toThrow("PlayerId cannot be empty");
    });

    it("should generate unique ID", () => {
      const id1 = PlayerId.generate();
      const id2 = PlayerId.generate();
      expect(id1.value).not.toBe(id2.value);
    });

    it("should check equality correctly", () => {
      const id1 = new PlayerId("test-id");
      const id2 = new PlayerId("test-id");
      const id3 = new PlayerId("different-id");

      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe("SessionId", () => {
    it("should create SessionId with valid value", () => {
      const id = new SessionId("session-id");
      expect(id.value).toBe("session-id");
    });

    it("should throw error for empty value", () => {
      expect(() => new SessionId("")).toThrow("SessionId cannot be empty");
    });

    it("should generate unique ID", () => {
      const id1 = SessionId.generate();
      const id2 = SessionId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe("TransactionId", () => {
    it("should create TransactionId with valid value", () => {
      const id = new TransactionId("transaction-id");
      expect(id.value).toBe("transaction-id");
    });

    it("should throw error for empty value", () => {
      expect(() => new TransactionId("")).toThrow(
        "TransactionId cannot be empty"
      );
    });

    it("should generate unique ID", () => {
      const id1 = TransactionId.generate();
      const id2 = TransactionId.generate();
      expect(id1.value).not.toBe(id2.value);
    });
  });
});

describe("Player Entity", () => {
  describe("create", () => {
    it("should create player with required fields", () => {
      const player = Player.create("John Doe");

      expect(player.name).toBe("John Doe");
      expect(player.email).toBeUndefined();
      expect(player.currentBankroll.amount).toBe(0);
      expect(player.createdAt).toBeInstanceOf(Date);
    });

    it("should create player with email and initial bankroll", () => {
      const email = "john@example.com";
      const bankroll = new Money(1000, "USD");
      const player = Player.create("John Doe", email, bankroll);

      expect(player.email).toBe(email);
      expect(player.currentBankroll).toBe(bankroll);
    });

    it("should generate unique ID", () => {
      const player1 = Player.create("Player 1");
      const player2 = Player.create("Player 2");

      expect(player1.id.value).not.toBe(player2.id.value);
    });
  });

  describe("updateBankroll", () => {
    it("should update bankroll with positive amount", () => {
      const player = Player.create("John Doe");
      const newBankroll = new Money(500, "USD");

      player.updateBankroll(newBankroll);

      expect(player.currentBankroll).toBe(newBankroll);
    });

    it("should update bankroll with zero amount", () => {
      const player = Player.create("John Doe");
      const newBankroll = new Money(0, "USD");

      player.updateBankroll(newBankroll);

      expect(player.currentBankroll).toBe(newBankroll);
    });
  });

  describe("updateEmail", () => {
    it("should update email", () => {
      const player = Player.create("John Doe");
      const newEmail = "newemail@example.com";

      player.updateEmail(newEmail);

      expect(player.email).toBe(newEmail);
    });

    it("should clear email when set to undefined", () => {
      const player = Player.create("John Doe", "old@example.com");

      player.updateEmail(undefined);

      expect(player.email).toBeUndefined();
    });
  });
});
