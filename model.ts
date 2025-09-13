// Poker Tracker App - TypeScript Models

export interface Player {
  id: string;
  name: string;
  email?: string;
  currentBankroll: number;
  totalProfit: number;
  totalSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  playerId: string;
  location: string;
  stakes: Stakes;
  startTime: Date;
  endTime?: Date;
  totalBuyIn: number;
  totalCashOut: number;
  netResult: number;
  status: SessionStatus;
  duration: number; // in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  sessionId: string;
  playerId: string;
  type: TransactionType;
  amount: number;
  timestamp: Date;
  description?: string;
  notes?: string;
}

// Removed Game interface since we're focusing on session-level tracking

// Simplified to focus on cash games only
export enum GameType {
  CASH = "cash",
}

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

export interface Stakes {
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  currency: string;
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

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalSessions: number;
  totalHours: number;
  totalBuyIn: number;
  totalCashOut: number;
  netProfit: number;
  biggestWin: number;
  biggestLoss: number;
  winRate: number; // percentage of winning sessions
  averageSession: number;
  hourlyRate: number;
  bestStreak: number;
  worstStreak: number;
  currentStreak: number;
  currentBankroll: number;
  lastSessionDate?: Date;
}

// Utility types for filtering and searching
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
  initialBuyIn: number;
  notes?: string;
}

export interface EndSessionRequest {
  sessionId: string;
  endTime: Date;
  finalCashOut: number;
  notes?: string;
}

export interface AddTransactionRequest {
  sessionId: string;
  playerId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  notes?: string;
}

// Utility functions for common calculations
export class PokerTrackerUtils {
  static calculateHourlyRate(
    netResult: number,
    durationMinutes: number
  ): number {
    if (durationMinutes <= 0) return 0;
    const hours = durationMinutes / 60;
    return netResult / hours;
  }

  static calculateBigBlindsWon(netResult: number, bigBlind: number): number {
    if (bigBlind <= 0) return 0;
    return netResult / bigBlind;
  }

  static formatStakes(stakes: Stakes): string {
    if (stakes.ante && stakes.ante > 0) {
      return `${stakes.smallBlind}/${stakes.bigBlind}/${stakes.ante}`;
    }
    return `${stakes.smallBlind}/${stakes.bigBlind}`;
  }

  static calculateWinRate(sessions: Session[]): number {
    if (sessions.length === 0) return 0;
    const winningSessions = sessions.filter((s) => s.netResult > 0).length;
    return (winningSessions / sessions.length) * 100;
  }

  static calculateStreak(sessions: Session[]): number {
    if (sessions.length === 0) return 0;

    let currentStreak = 0;
    const lastSession = sessions[sessions.length - 1];
    const isWinning = lastSession.netResult > 0;

    for (let i = sessions.length - 1; i >= 0; i--) {
      const session = sessions[i];
      if (
        (isWinning && session.netResult > 0) ||
        (!isWinning && session.netResult <= 0)
      ) {
        currentStreak++;
      } else {
        break;
      }
    }

    return isWinning ? currentStreak : -currentStreak;
  }
}
