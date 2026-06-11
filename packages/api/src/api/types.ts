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
    defaultPlayerId: string;
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
  defaultPlayerId?: string;
  preferredLanguage: string;
  defaultCurrency: string;
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

export interface StartSessionRequest {
  userId: string;
  initialBuyInPlayerId?: string;
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
  userId: string;
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
  userId: string;
  playerId: string;
  finalCashOut: {
    amount: number;
    currency: string;
  };
  notes?: string;
}

export interface EndSessionResponse {
  sessionId: string;
  userId: string;
  finalCashOut: {
    amount: number;
    currency: string;
  };
  profitLoss: {
    amount: number;
    currency: string;
  };
  duration: number;
  status: string;
  endedAt: Date;
}

export interface AddTransactionRequest {
  sessionId: string;
  userId: string;
  playerId: string;
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
  playerId: string;
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
  userId: string;
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
    playerId: string;
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
  duration?: number;
  hands: HandSummaryResponse[];
}

export type HandStateInput = Record<string, unknown>;

export interface HandSummaryResponse {
  handId: string;
  sessionId: string;
  captureType: string;
  potAmount?: number;
  netResult?: number;
  currency: string;
  tags: string[];
  note?: string;
  createdAt: Date;
}

export interface HandResponse extends HandSummaryResponse {
  heroPlayerId?: string;
  handState: HandStateInput;
  schemaVersion: number;
  updatedAt: Date;
}

export interface CreateHandResponse extends HandResponse {}

export interface UpdateHandResponse extends HandResponse {}

export interface ListHandsResponse {
  hands: HandSummaryResponse[];
}

export interface ListSessionsRequest {
  userId: string;
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
  userId: string;
  notes: string;
}

export interface UpdateSessionNotesResponse {
  sessionId: string;
  notes: string;
  updatedAt: Date;
}

export interface CancelSessionRequest {
  reason?: string;
  playerId?: string;
}

export interface CancelSessionResponse extends EndSessionResponse {
  notes?: string;
}
