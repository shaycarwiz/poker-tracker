export type CaptureType = 'snapshot' | 'full';

export type HandOutcome = 'won' | 'lost' | 'split';

export type HandActionType =
  | 'fold'
  | 'check'
  | 'call'
  | 'bet'
  | 'raise'
  | 'all_in';

export interface HandAction {
  seat: number;
  type: HandActionType;
  amount?: number;
}

export interface HandPlayer {
  seat: number;
  name: string;
  playerId?: string;
  stack: number;
  holeCards?: string[] | null;
}

export interface HandStreet {
  name: 'preflop' | 'flop' | 'turn' | 'river';
  board: string[];
  actions: HandAction[];
}

export interface SnapshotHandState {
  schemaVersion: 1;
  heroCards: string[];
  board: string[];
  villainName?: string;
  villainCards?: string[];
  pot: number;
  outcome: HandOutcome;
  netResult?: number;
}

export interface FullHandState {
  schemaVersion: 1;
  variant: 'NLH';
  buttonSeat: number;
  players: HandPlayer[];
  streets: HandStreet[];
  result: {
    winnerSeats: number[];
    pot: number;
    shownCards?: Record<string, string[]>;
  };
}

export type HandStateV1 = SnapshotHandState | FullHandState;

export interface HandSummary {
  handId: string;
  sessionId: string;
  captureType: CaptureType;
  potAmount?: number;
  netResult?: number;
  currency: string;
  tags: string[];
  note?: string;
  createdAt: string;
}

export interface Hand extends HandSummary {
  heroPlayerId?: string;
  handState: HandStateV1;
  schemaVersion: number;
  updatedAt: string;
}

export interface CreateHandRequest {
  captureType: CaptureType;
  handState: HandStateV1;
  heroPlayerId?: string;
  tags?: string[];
  note?: string;
}

export interface UpdateHandRequest {
  handState: HandStateV1;
  heroPlayerId?: string;
  tags?: string[];
  note?: string;
}
