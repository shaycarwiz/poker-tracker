const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
const SUITS = ['c', 'd', 'h', 's'] as const;

export const ALL_CARDS: string[] = RANKS.flatMap((rank) =>
  SUITS.map((suit) => `${rank}${suit}`)
);

export function formatCard(card: string): string {
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  const suitSymbol: Record<string, string> = {
    c: '♣',
    d: '♦',
    h: '♥',
    s: '♠',
  };
  return `${rank}${suitSymbol[suit] ?? suit}`;
}

export function cardSuitColor(card: string): 'red' | 'black' {
  const suit = card.slice(-1);
  return suit === 'h' || suit === 'd' ? 'red' : 'black';
}

export function createEmptyFullHandState(): import('@/types').FullHandState {
  return {
    schemaVersion: 1,
    variant: 'NLH',
    buttonSeat: 1,
    players: [
      { seat: 1, name: 'Hero', stack: 200, holeCards: [] },
      { seat: 2, name: 'Villain', stack: 200, holeCards: null },
    ],
    streets: [
      { name: 'preflop', board: [], actions: [] },
      { name: 'flop', board: [], actions: [] },
      { name: 'turn', board: [], actions: [] },
      { name: 'river', board: [], actions: [] },
    ],
    result: { winnerSeats: [1], pot: 0 },
  };
}

export function createEmptySnapshotState(): import('@/types').SnapshotHandState {
  return {
    schemaVersion: 1,
    heroCards: [],
    board: [],
    pot: 0,
    outcome: 'won',
  };
}

export function flattenHandActions(
  streets: import('@/types').HandStreet[]
): Array<{ streetIndex: number; actionIndex: number }> {
  const steps: Array<{ streetIndex: number; actionIndex: number }> = [];
  streets.forEach((street, streetIndex) => {
    street.actions.forEach((_, actionIndex) => {
      steps.push({ streetIndex, actionIndex });
    });
  });
  return steps;
}

export function getBoardUpToStep(
  streets: import('@/types').HandStreet[],
  stepIndex: number
): string[] {
  const steps = flattenHandActions(streets);
  if (stepIndex < 0) {
    return [];
  }

  let maxStreetIndex = 0;
  const limit = Math.min(stepIndex, steps.length - 1);
  for (let i = 0; i <= limit; i += 1) {
    maxStreetIndex = Math.max(maxStreetIndex, steps[i].streetIndex);
  }

  const board: string[] = [];
  for (let i = 0; i <= maxStreetIndex; i += 1) {
    const street = streets[i];
    if (street.name !== 'preflop' && street.board.length > 0) {
      board.push(...street.board);
    }
  }
  return board;
}
