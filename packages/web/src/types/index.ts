export interface Session {
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
  currentCashOut?: {
    amount: number;
    currency: string;
  };
  profitLoss?: {
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

export interface Player {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  totalSessions: number;
  totalHours: number;
  totalProfit: number;
  winRate: number;
  averageSessionDuration: number;
  averageProfit: number;
  bestSession: Session;
  worstSession: Session;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  sessions: number;
  profit: number;
  hours: number;
  winRate: number;
}

export type GameType = 'NLH' | 'PLO' | 'PLO5' | 'Stud' | 'Razz' | 'Mixed';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
