// Types - Interfaces and utility types for the domain

import { Money, Stakes } from "./value-objects";
import { SessionStatus, TransactionType } from "./enums";

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
