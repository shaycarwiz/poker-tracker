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
  gameType: GameType;
  stakes: Stakes;
  startTime: Date;
  endTime?: Date;
  totalBuyIn: number;
  totalCashOut: number;
  netResult: number;
  status: SessionStatus;
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

export interface Game {
  id: string;
  sessionId: string;
  gameNumber: number;
  startTime: Date;
  endTime?: Date;
  smallBlind: number;
  bigBlind: number;
  players: number;
  position: number;
  result: number; // positive for win, negative for loss
  notes?: string;
}

export enum GameType {
  CASH = "cash",
  TOURNAMENT = "tournament",
  SIT_N_GO = "sit_n_go",
  MTT = "mtt", // Multi-table tournament
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
  duration: number; // in minutes
  totalBuyIn: number;
  totalCashOut: number;
  netResult: number;
  hourlyRate: number;
  handsPlayed: number;
  vpip: number; // Voluntarily Put $ In Pot
  pfr: number; // Pre-Flop Raise
  bbPer100: number; // Big blinds per 100 hands
}

export interface PlayerStats {
  playerId: string;
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
}

// Utility types for filtering and searching
export interface SessionFilters {
  playerId?: string;
  gameType?: GameType;
  dateFrom?: Date;
  dateTo?: Date;
  minBuyIn?: number;
  maxBuyIn?: number;
  status?: SessionStatus;
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
