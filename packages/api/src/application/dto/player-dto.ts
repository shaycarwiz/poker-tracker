// Player DTOs for data transfer between layers

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
  preferredLanguage: string;
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
