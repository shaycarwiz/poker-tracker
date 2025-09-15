// Aggregates - Root entities that maintain consistency boundaries

import { PlayerId } from "./entities";
import { Money, Duration } from "./value-objects";

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

  static Empty = new PlayerStats(
    new PlayerId("N/A"),
    "N/A",
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
    0,
    new Money(0)
  );

  copyWith({
    playerId,
    playerName,
    totalSessions,
    totalDuration,
    totalBuyIn,
    totalCashOut,
    netProfit,
    biggestWin,
    biggestLoss,
    winRate,
    averageSession,
    hourlyRate,
    bestStreak,
    worstStreak,
    currentStreak,
    currentBankroll,
    lastSessionDate,
  }: Partial<PlayerStats>): PlayerStats {
    return new PlayerStats(
      playerId ?? this.playerId,
      playerName ?? this.playerName,
      totalSessions ?? this.totalSessions,
      totalDuration ?? this.totalDuration,
      totalBuyIn ?? this.totalBuyIn,
      totalCashOut ?? this.totalCashOut,
      netProfit ?? this.netProfit,
      biggestWin ?? this.biggestWin,
      biggestLoss ?? this.biggestLoss,
      winRate ?? this.winRate,
      averageSession ?? this.averageSession,
      hourlyRate ?? this.hourlyRate,
      bestStreak ?? this.bestStreak,
      worstStreak ?? this.worstStreak,
      currentStreak ?? this.currentStreak,
      currentBankroll ?? this.currentBankroll,
      lastSessionDate ?? this.lastSessionDate
    );
  }

  static create(
    values: Partial<{
      playerId: PlayerId;
      playerName: string;
      totalSessions: number;
      totalDuration: Duration;
      totalBuyIn: Money;
      totalCashOut: Money;
      netProfit: Money;
      biggestWin: Money;
      biggestLoss: Money;
      winRate: number;
      averageSession: Money;
      hourlyRate: Money;
      bestStreak: number;
      worstStreak: number;
      currentStreak: number;
      currentBankroll: Money;
      lastSessionDate: Date | undefined;
    }>
  ): PlayerStats {
    return new PlayerStats(
      values.playerId ?? PlayerStats.Empty.playerId,
      values.playerName ?? PlayerStats.Empty.playerName,
      values.totalSessions ?? PlayerStats.Empty.totalSessions,
      values.totalDuration ?? PlayerStats.Empty.totalDuration,
      values.totalBuyIn ?? PlayerStats.Empty.totalBuyIn,
      values.totalCashOut ?? PlayerStats.Empty.totalCashOut,
      values.netProfit ?? PlayerStats.Empty.netProfit,
      values.biggestWin ?? PlayerStats.Empty.biggestWin,
      values.biggestLoss ?? PlayerStats.Empty.biggestLoss,
      values.winRate ?? PlayerStats.Empty.winRate,
      values.averageSession ?? PlayerStats.Empty.averageSession,
      values.hourlyRate ?? PlayerStats.Empty.hourlyRate,
      values.bestStreak ?? PlayerStats.Empty.bestStreak,
      values.worstStreak ?? PlayerStats.Empty.worstStreak,
      values.currentStreak ?? PlayerStats.Empty.currentStreak,
      values.currentBankroll ?? PlayerStats.Empty.currentBankroll,
      values.lastSessionDate ?? PlayerStats.Empty.lastSessionDate
    );
  }
}
