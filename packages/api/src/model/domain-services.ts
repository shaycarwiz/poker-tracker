// Domain Services - Business logic that doesn't belong to a single entity

import { Player, PlayerId, Session } from "./entities";
import { PlayerStats } from "./aggregates";
import { Duration, Money } from "./value-objects";
import { SessionStatus, TransactionType } from "./enums";
import { BusinessError, API_ERROR_CODES } from "../shared";

export class PlayerStatsService {
  calculateStats(player: Player, sessions: Session[]): PlayerStats {
    const playerSessions = sessions
      .filter((s) => s.status === SessionStatus.COMPLETED)
      .filter((s) =>
        s.transactions.some((t) => t.playerId.equals(player.id))
      );

    return this.calculateFromPlayerSessions(player, playerSessions);
  }

  private calculateFromPlayerSessions(
    player: Player,
    completedSessions: Session[]
  ): PlayerStats {

    if (completedSessions.length === 0) {
      return PlayerStats.create({
        playerId: player.id,
        playerName: player.name,
        currentBankroll: player.currentBankroll,
      });
    }

    const currency = completedSessions?.[0]?.stakes.bigBlind.currency;
    if (!currency) {
      throw new BusinessError(API_ERROR_CODES.BUSINESS_CURRENCY_NOT_FOUND);
    }

    const totalBuyIn = completedSessions.reduce(
      (sum, s) => sum.add(this.playerBuyIn(s, player.id)),
      new Money(0, currency)
    );
    const totalCashOut = completedSessions.reduce(
      (sum, s) => sum.add(this.playerCashOut(s, player.id)),
      new Money(0, currency)
    );
    const netProfit = totalCashOut.subtract(totalBuyIn);
    const totalDuration = completedSessions.reduce((sum, s) => {
      const { duration } = s;

      return duration ? sum.add(duration) : sum;
    }, new Duration(0));

    const winningSessions = completedSessions.filter(
      (s) => this.playerNetResult(s, player.id).amount > 0
    );
    const winRate = (winningSessions.length / completedSessions.length) * 100;

    const hourlyRate =
      totalDuration.hours > 0
        ? new Money(netProfit.amount / totalDuration.hours, netProfit.currency)
        : new Money(0);

    const results = completedSessions.map((s) =>
      this.playerNetResult(s, player.id).amount
    );
    const biggestWin = new Money(Math.max(...results, 0), netProfit.currency);
    const biggestLoss = new Money(
      Math.abs(Math.min(...results, 0)),
      netProfit.currency
    );

    const streak = this.calculateStreak(completedSessions, player.id);

    return PlayerStats.create({
      playerId: player.id,
      playerName: player.name,
      totalSessions: completedSessions.length,
      totalDuration,
      totalBuyIn,
      totalCashOut,
      netProfit,
      biggestWin,
      biggestLoss,
      winRate,
      averageSession: new Money(
        netProfit.amount / completedSessions.length,
        netProfit.currency
      ),
      hourlyRate,
      bestStreak: streak.best,
      worstStreak: streak.worst,
      currentStreak: streak.current,
      currentBankroll: player.currentBankroll,
      lastSessionDate: completedSessions[completedSessions.length - 1]?.endTime,
    });
  }

  private playerBuyIn(session: Session, playerId: PlayerId): Money {
    const currency = session.stakes.bigBlind.currency;
    return session.transactions
      .filter(
        (t) =>
          t.playerId.equals(playerId) &&
          (t.type === TransactionType.BUY_IN ||
            t.type === TransactionType.REBUY)
      )
      .reduce((sum, t) => sum.add(t.amount), new Money(0, currency));
  }

  private playerCashOut(session: Session, playerId: PlayerId): Money {
    const currency = session.stakes.bigBlind.currency;
    return session.transactions
      .filter(
        (t) =>
          t.playerId.equals(playerId) && t.type === TransactionType.CASH_OUT
      )
      .reduce((sum, t) => sum.add(t.amount), new Money(0, currency));
  }

  private playerNetResult(session: Session, playerId: PlayerId): Money {
    return this.playerCashOut(session, playerId).subtract(
      this.playerBuyIn(session, playerId)
    );
  }

  private calculateStreak(
    sessions: Session[],
    playerId: PlayerId
  ): {
    best: number;
    worst: number;
    current: number;
  } {
    if (sessions.length === 0) return { best: 0, worst: 0, current: 0 };

    let currentStreak = 0;
    let maxStreak = 0;
    let minStreak = 0;

    for (const session of sessions) {
      if (this.playerNetResult(session, playerId).amount > 0) {
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
