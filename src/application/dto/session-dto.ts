// Session DTOs for data transfer between layers

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
  notes?: string | undefined;
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
  notes?: string | undefined;
  status: string;
  startedAt: Date;
}

export interface EndSessionRequest {
  sessionId: string;
  finalCashOut: {
    amount: number;
    currency: string;
  };
  notes?: string | undefined;
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
  description?: string | undefined;
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
  notes?: string | undefined;
  transactions: {
    id: string;
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
  duration?: number | undefined; // in minutes
}

export interface ListSessionsRequest {
  playerId?: string;
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
