// TSOA-specific type definitions
// This file ensures TSOA can properly resolve all types
// Types are defined here to avoid TSOA import resolution issues
//
// IMPORTANT: These types must be kept in sync with the original DTOs in:
// - @/application/dto/player-dto.ts
// - @/application/dto/session-dto.ts

// Player DTOs for TSOA
export interface CreatePlayerRequest {
  name: string;
  email?: string;
  initialBankroll?: {
    amount: number;
    currency: string;
  };
}

export interface CreatePlayerResponse {
  id: string;
  name: string;
  email?: string | undefined;
  bankroll: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
}

export interface UpdatePlayerRequest {
  id: string;
  name?: string;
  email?: string;
}

export interface UpdatePlayerResponse {
  id: string;
  name: string;
  email?: string | undefined;
  bankroll: {
    amount: number;
    currency: string;
  };
  updatedAt: Date;
}

export interface GetPlayerResponse {
  id: string;
  name: string;
  email?: string | undefined;
  bankroll: {
    amount: number;
    currency: string;
  };
  totalSessions: number;
  totalWinnings: {
    amount: number;
    currency: string;
  };
  winRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListPlayersResponse {
  players: GetPlayerResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface AddBankrollRequest {
  playerId: string;
  amount: {
    amount: number;
    currency: string;
  };
  reason?: string;
}

export interface AddBankrollResponse {
  playerId: string;
  newBankroll: {
    amount: number;
    currency: string;
  };
  addedAmount: {
    amount: number;
    currency: string;
  };
  addedAt: Date;
}

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// TSOA-specific additional types
export interface PlayerStatsResponse {
  playerId: string;
  totalSessions: number;
  totalWinnings: number;
  winRate: number;
  averageSession: number;
}

export interface SearchPlayersResponse {
  players: GetPlayerResponse[];
  total: number;
  page: number;
  limit: number;
}

// Auth-specific types for TSOA
export interface LoginRequest {
  googleId: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    currentBankroll: number;
    totalSessions: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  currentBankroll: number;
  totalSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
}

// Session DTOs for TSOA
export interface StartSessionRequest {
  playerId: string;
  location: string;
  stakes: {
    smallBlind: number;
    bigBlind: number;
    currency: string;
  };
  initialBuyIn: {
    amount: number;
    currency: string;
  };
  notes?: string;
}

export interface StartSessionResponse {
  sessionId: string;
  playerId: string;
  location: string;
  stakes: {
    smallBlind: number;
    bigBlind: number;
    currency: string;
  };
  initialBuyIn: {
    amount: number;
    currency: string;
  };
  notes?: string;
  status: string;
  startedAt: Date;
}

export interface EndSessionRequest {
  sessionId: string;
  finalCashOut: {
    amount: number;
    currency: string;
  };
  notes?: string;
}

export interface EndSessionResponse {
  sessionId: string;
  playerId: string;
  finalCashOut: {
    amount: number;
    currency: string;
  };
  profitLoss: {
    amount: number;
    currency: string;
  };
  duration: number; // in minutes
  status: string;
  endedAt: Date;
}

export interface AddTransactionRequest {
  sessionId: string;
  type: string;
  amount: {
    amount: number;
    currency: string;
  };
  description?: string;
}

export interface AddTransactionResponse {
  transactionId: string;
  sessionId: string;
  type: string;
  amount: {
    amount: number;
    currency: string;
  };
  description?: string;
  addedAt: Date;
}

export interface GetSessionResponse {
  sessionId: string;
  playerId: string;
  location: string;
  stakes: {
    smallBlind: number;
    bigBlind: number;
    currency: string;
  };
  initialBuyIn: {
    amount: number;
    currency: string;
  };
  currentCashOut: {
    amount: number;
    currency: string;
  };
  profitLoss: {
    amount: number;
    currency: string;
  };
  status: string;
  notes?: string;
  transactions: {
    id: string;
    type: string;
    amount: {
      amount: number;
      currency: string;
    };
    description?: string;
    createdAt: Date;
  }[];
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in minutes
}

export interface ListSessionsRequest {
  playerId?: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ListSessionsResponse {
  sessions: GetSessionResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateSessionNotesRequest {
  sessionId: string;
  notes: string;
}

export interface UpdateSessionNotesResponse {
  sessionId: string;
  notes: string;
  updatedAt: Date;
}

export interface CancelSessionRequest {
  reason?: string;
}

export interface CancelSessionResponse {
  sessionId: string;
  playerId: string;
  finalCashOut: {
    amount: number;
    currency: string;
  };
  profitLoss: {
    amount: number;
    currency: string;
  };
  duration: number; // in minutes
  status: string;
  endedAt: Date;
  notes: string;
}
