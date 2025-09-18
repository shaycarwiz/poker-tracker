// Repository interfaces - Domain layer abstractions for data access

import {
  Player,
  PlayerId,
  Session,
  SessionId,
  Transaction,
  TransactionId,
} from "./entities";
import { SessionFilters, TransactionFilters } from "./types";

// Base repository interface
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}

// Player repository interface
export interface PlayerRepository extends Repository<Player, PlayerId> {
  findByEmail(email: string): Promise<Player | null>;
  findByGoogleId(googleId: string): Promise<Player | null>;
  findAll(): Promise<Player[]>;
  findByName(name: string): Promise<Player[]>;
}

// Session repository interface
export interface SessionRepository extends Repository<Session, SessionId> {
  findByPlayerId(playerId: PlayerId): Promise<Session[]>;
  findActiveByPlayerId(playerId: PlayerId): Promise<Session | null>;
  findByFilters(
    filters: SessionFilters
  ): Promise<{ sessions: Session[]; total: number }>;
  findCompletedByPlayerId(playerId: PlayerId): Promise<Session[]>;
  findRecentByPlayerId(playerId: PlayerId, limit: number): Promise<Session[]>;
}

// Transaction repository interface
export interface TransactionRepository
  extends Repository<Transaction, TransactionId> {
  findBySessionId(sessionId: SessionId): Promise<Transaction[]>;
  findByPlayerId(playerId: PlayerId): Promise<Transaction[]>;
  findByFilters(filters: TransactionFilters): Promise<Transaction[]>;
}

// Unit of Work pattern for transaction management
export interface UnitOfWork {
  players: PlayerRepository;
  sessions: SessionRepository;
  transactions: TransactionRepository;

  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
