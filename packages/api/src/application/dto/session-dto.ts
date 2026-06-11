import { HandSummaryResponse } from "./hand-dto";

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
  notes?: string | undefined;
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
  notes?: string | undefined;
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
  notes?: string | undefined;
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
  description?: string | undefined;
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
  notes?: string | undefined;
  transactions: {
    id: string;
    playerId: string;
    type: string;
    amount: {
      amount: number;
      currency: string;
    };
    description?: string | undefined;
    createdAt: Date;
  }[];
  startedAt: Date;
  endedAt?: Date | undefined;
  duration?: number | undefined;
  hands: HandSummaryResponse[];
}

export interface ListSessionsRequest {
  userId: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
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
