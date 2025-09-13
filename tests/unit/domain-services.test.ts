import { PlayerStatsService } from "@/model/domain-services";
import { Player, Session } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";

describe("PlayerStatsService", () => {
  let service: PlayerStatsService;
  let player: Player;
  let sessions: Session[];

  beforeEach(() => {
    service = new PlayerStatsService();
    player = Player.create(
      "John Doe",
      "john@example.com",
      new Money(1000, "USD")
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
      // Create test sessions
      const session1 = Session.start(
        player.id,
        "Test Session 1",
        new Stakes(new Money(100, "USD"), new Money(200, "USD")),
        new Money(150, "USD"),
        "Test Session 1"
      );
      session1.end(new Money(150, "USD"), "Test Session 1");

      const session2 = Session.start(
        player.id,
        "Test Session 2",
        new Stakes(new Money(100, "USD"), new Money(200, "USD")),
        new Money(80, "USD"),
        "Test Session 2"
      );
      session2.end(new Money(80, "USD"), "Test Session 2");

      sessions = [session1, session2];
      const result = service.calculateStats(player, sessions);

      expect(result.totalSessions).toBe(2);
      expect(result.totalBuyIn.amount).toBe(200);
      expect(result.totalCashOut.amount).toBe(230);
      expect(result.netProfit.amount).toBe(30);
      expect(result.winRate).toBe(50); // 1 winning session out of 2
    });

    it("should calculate hourly rate correctly", () => {
      const session = Session.start(
        player.id,
        "Test Session",
        new Stakes(new Money(100, "USD"), new Money(200, "USD")),
        new Money(200, "USD"),
        "Test Session"
      );
      session.end(new Money(100, "USD"), "Test Session");

      const result = service.calculateStats(player, [session]);

      expect(result.hourlyRate.amount).toBe(50); // $100 profit / 2 hours
    });

    it("should handle zero duration sessions", () => {
      const session = Session.start(
        player.id,
        "Test Session",
        new Stakes(new Money(100, "USD"), new Money(200, "USD")),
        new Money(150, "USD"),
        "Test Session"
      );
      session.end(new Money(150, "USD"), "Test Session");

      const result = service.calculateStats(player, [session]);

      expect(result.hourlyRate.amount).toBe(0);
    });
  });
});
