import { PlayerStatsService } from "@/model/domain-services";
import { Player, Session, Transaction, UserId } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";
import { TransactionType, SessionStatus } from "@/model/enums";
import { config } from "@/infrastructure";

const testUserId = new UserId("user-123");

describe("PlayerStatsService", () => {
  let service: PlayerStatsService;
  let player: Player;

  beforeEach(() => {
    service = new PlayerStatsService();
    player = Player.create(
      "John Doe",
      testUserId,
      "john@example.com",
      new Money(1000, config.poker.defaultCurrency)
    );
  });

  describe("calculateStats", () => {
    it("should return empty stats for no completed sessions", () => {
      const result = service.calculateStats(player, []);

      expect(result.playerId).toBe(player.id);
      expect(result.playerName).toBe(player.name);
      expect(result.currentBankroll).toBe(player.currentBankroll);
      expect(result.totalSessions).toBe(0);
      expect(result.winRate).toBe(0);
    });

    it("should calculate stats for completed sessions", () => {
      const session1 = Session.start(
        testUserId,
        "Test Session 1",
        new Stakes(
          new Money(100, config.poker.defaultCurrency),
          new Money(200, config.poker.defaultCurrency)
        ),
        new Money(150, config.poker.defaultCurrency),
        player.id,
        "Test Session 1"
      );
      session1.end(
        player.id,
        new Money(150, config.poker.defaultCurrency),
        "Test Session 1"
      );

      const session2 = Session.start(
        testUserId,
        "Test Session 2",
        new Stakes(
          new Money(100, config.poker.defaultCurrency),
          new Money(200, config.poker.defaultCurrency)
        ),
        new Money(80, config.poker.defaultCurrency),
        player.id,
        "Test Session 2"
      );
      session2.end(
        player.id,
        new Money(80, config.poker.defaultCurrency),
        "Test Session 2"
      );

      const result = service.calculateStats(player, [session1, session2]);

      expect(result.totalSessions).toBe(2);
      expect(result.totalBuyIn.amount).toBe(230);
      expect(result.totalCashOut.amount).toBe(230);
      expect(result.netProfit.amount).toBe(0);
      expect(result.winRate).toBe(0);
    });

    it("should calculate hourly rate correctly", () => {
      const session = Session.start(
        testUserId,
        "Test Session",
        new Stakes(
          new Money(100, config.poker.defaultCurrency),
          new Money(200, config.poker.defaultCurrency)
        ),
        new Money(100, config.poker.defaultCurrency),
        player.id,
        "Test Session"
      );

      const endTime = new Date(
        session.startTime.getTime() + 2 * 60 * 60 * 1000
      );
      (session as any)._endTime = endTime;
      (session as any)._status = SessionStatus.COMPLETED;

      const transaction = new Transaction(
        { value: "test-transaction-id" } as any,
        session.id,
        player.id,
        TransactionType.CASH_OUT,
        new Money(200, config.poker.defaultCurrency),
        endTime,
        "Final cash out"
      );
      (session as any)._transactions.push(transaction);

      const result = service.calculateStats(player, [session]);

      expect(result.hourlyRate.amount).toBe(50);
    });

    it("should handle zero duration sessions", () => {
      const session = Session.start(
        testUserId,
        "Test Session",
        new Stakes(
          new Money(100, config.poker.defaultCurrency),
          new Money(200, config.poker.defaultCurrency)
        ),
        new Money(150, config.poker.defaultCurrency),
        player.id,
        "Test Session"
      );
      session.end(
        player.id,
        new Money(150, config.poker.defaultCurrency),
        "Test Session"
      );

      const result = service.calculateStats(player, [session]);

      expect(result.hourlyRate.amount).toBe(0);
    });
  });
});
