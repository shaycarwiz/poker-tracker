// Repository interfaces - Domain layer abstractions for data access

import {
  Hand,
  HandId,
  Player,
  PlayerId,
  Session,
  SessionId,
  Transaction,
  TransactionId,
  User,
  UserId,
} from "./entities";
import { SessionFilters, TransactionFilters } from "./types";

// Base repository interface
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
}

// User repository interface
export interface UserRepository extends Repository<User, UserId> {
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

// Player repository interface
export interface PlayerRepository extends Repository<Player, PlayerId> {
  findByOwnerUserId(userId: UserId): Promise<Player[]>;
  findByOwnerUserIdPaginated(
    userId: UserId,
    page: number,
    limit: number
  ): Promise<{ players: Player[]; total: number }>;
  findByName(name: string): Promise<Player[]>;
}

// Session repository interface
export interface SessionRepository extends Repository<Session, SessionId> {
  findByUserId(userId: UserId): Promise<Session[]>;
  findActiveByUserId(userId: UserId): Promise<Session | null>;
  findByFilters(
    filters: SessionFilters
  ): Promise<{ sessions: Session[]; total: number }>;
  findCompletedByUserId(userId: UserId): Promise<Session[]>;
  findRecentByUserId(userId: UserId, limit: number): Promise<Session[]>;
}

// Transaction repository interface
export interface TransactionRepository
  extends Repository<Transaction, TransactionId> {
  findBySessionId(sessionId: SessionId): Promise<Transaction[]>;
  findByPlayerId(playerId: PlayerId): Promise<Transaction[]>;
  findByFilters(filters: TransactionFilters): Promise<Transaction[]>;
}

// Hand repository interface
export interface HandRepository extends Repository<Hand, HandId> {
  findBySessionId(sessionId: SessionId): Promise<Hand[]>;
}

// Unit of Work pattern for transaction management
export interface UnitOfWork {
  users: UserRepository;
  players: PlayerRepository;
  sessions: SessionRepository;
  transactions: TransactionRepository;
  hands: HandRepository;

  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
