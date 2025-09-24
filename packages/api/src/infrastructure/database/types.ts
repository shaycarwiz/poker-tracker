// Database table types based on migration files

export interface PlayerRow {
  id: string; // UUID
  name: string;
  email: string | null;
  google_id: string | null;
  current_bankroll: string; // DECIMAL(15,2) - PostgreSQL returns as string
  currency: string; // VARCHAR(3)
  total_sessions: number;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRow {
  id: string; // UUID
  player_id: string; // UUID, references players(id)
  location: string;
  small_blind: string; // DECIMAL(15,2) - PostgreSQL returns as string
  big_blind: string; // DECIMAL(15,2) - PostgreSQL returns as string
  ante: string | null; // DECIMAL(15,2) - PostgreSQL returns as string
  currency: string; // VARCHAR(3)
  start_time: Date;
  end_time: Date | null;
  status: "active" | "completed" | "cancelled";
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionRow {
  id: string; // UUID
  session_id: string; // UUID, references sessions(id)
  player_id: string; // UUID, references players(id)
  type:
    | "buy_in"
    | "cash_out"
    | "rebuy"
    | "add_on"
    | "tip"
    | "rakeback"
    | "bonus"
    | "other";
  amount: string; // DECIMAL(15,2) - PostgreSQL returns as string
  currency: string; // VARCHAR(3)
  timestamp: Date;
  description: string | null;
  notes: string | null;
  created_at: Date;
}

export interface MigrationRow {
  id: number; // SERIAL
  filename: string;
  applied_at: Date;
  checksum: string;
  execution_time_ms: number;
}

// View types for complex queries
export interface SessionSummaryRow {
  session_id: string;
  player_id: string;
  player_name: string;
  location: string;
  stakes: string; // Formatted stakes like "1/2/0.5"
  start_time: Date;
  end_time: Date | null;
  status: "active" | "completed" | "cancelled";
  duration_minutes: number | null;
  total_buy_in: number;
  total_cash_out: number;
  net_result: number;
  hourly_rate: number | null;
  big_blinds_won: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PlayerStatisticsRow {
  player_id: string;
  player_name: string;
  current_bankroll: number;
  currency: string;
  total_sessions: number;
  total_duration_minutes: number | null;
  total_buy_in: number;
  total_cash_out: number;
  net_profit: number | null;
  biggest_win: number | null;
  biggest_loss: number | null;
  average_session: number | null;
  average_hourly_rate: number | null;
  winning_sessions: number;
  win_rate: number | null;
  last_session_date: Date | null;
}

// Input types for creating new records
export interface CreatePlayerInputRow {
  name: string;
  email?: string;
  current_bankroll?: number;
  currency?: string;
}

export interface CreateSessionInputRow {
  player_id: string;
  location: string;
  small_blind: number;
  big_blind: number;
  ante?: number;
  currency?: string;
  start_time: Date;
  notes?: string;
}

export interface CreateTransactionInputRow {
  session_id: string;
  player_id: string;
  type: TransactionRow["type"];
  amount: number;
  currency?: string;
  timestamp: Date;
  description?: string;
  notes?: string;
}

// Update types for modifying existing records
export interface UpdatePlayerInputRow {
  name?: string;
  email?: string;
  current_bankroll?: number;
  currency?: string;
}

export interface UpdateSessionInputRow {
  location?: string;
  small_blind?: number;
  big_blind?: number;
  ante?: number;
  currency?: string;
  end_time?: Date;
  status?: SessionRow["status"];
  notes?: string;
}

// Query filter types
export interface PlayerFilters {
  name?: string;
  email?: string;
  currency?: string;
  created_after?: Date;
  created_before?: Date;
}

export interface SessionFilters {
  player_id?: string;
  status?: SessionRow["status"];
  location?: string;
  start_after?: Date;
  start_before?: Date;
  end_after?: Date;
  end_before?: Date;
}

export interface TransactionFilters {
  session_id?: string;
  player_id?: string;
  type?: TransactionRow["type"];
  amount_min?: number;
  amount_max?: number;
  timestamp_after?: Date;
  timestamp_before?: Date;
}

// Pagination types
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: "ASC" | "DESC";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}
