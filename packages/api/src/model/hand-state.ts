import { z } from "zod";

const CARD_REGEX = /^[2-9TJQKA][cdhs]$/;

export const cardSchema = z.string().regex(CARD_REGEX, "Invalid card notation");

export const handActionTypeSchema = z.enum([
  "fold",
  "check",
  "call",
  "bet",
  "raise",
  "all_in",
]);

export const handActionSchema = z.object({
  seat: z.number().int().min(1).max(10),
  type: handActionTypeSchema,
  amount: z.number().nonnegative().optional(),
});

export const handPlayerSchema = z.object({
  seat: z.number().int().min(1).max(10),
  name: z.string().min(1).max(100),
  playerId: z.string().uuid().optional(),
  stack: z.number().nonnegative(),
  holeCards: z.array(cardSchema).max(2).nullable().optional(),
});

export const handStreetSchema = z.object({
  name: z.enum(["preflop", "flop", "turn", "river"]),
  board: z.array(cardSchema).max(5),
  actions: z.array(handActionSchema),
});

export const snapshotHandStateSchema = z.object({
  schemaVersion: z.literal(1),
  heroCards: z.array(cardSchema).min(1).max(2),
  board: z.array(cardSchema).max(5),
  villainName: z.string().max(100).optional(),
  villainCards: z.array(cardSchema).max(2).optional(),
  pot: z.number().nonnegative(),
  outcome: z.enum(["won", "lost", "split"]),
  netResult: z.number().optional(),
});

export const fullHandStateSchema = z.object({
  schemaVersion: z.literal(1),
  variant: z.literal("NLH"),
  buttonSeat: z.number().int().min(1).max(10),
  players: z.array(handPlayerSchema).min(2).max(10),
  streets: z.array(handStreetSchema).min(1),
  result: z.object({
    winnerSeats: z.array(z.number().int().min(1).max(10)),
    pot: z.number().nonnegative(),
    shownCards: z.record(z.string(), z.array(cardSchema).max(2)).optional(),
  }),
});

export type Card = z.infer<typeof cardSchema>;
export type HandAction = z.infer<typeof handActionSchema>;
export type HandPlayer = z.infer<typeof handPlayerSchema>;
export type HandStreet = z.infer<typeof handStreetSchema>;
export type SnapshotHandState = z.infer<typeof snapshotHandStateSchema>;
export type FullHandState = z.infer<typeof fullHandStateSchema>;
export type HandStateV1 = SnapshotHandState | FullHandState;

export type CaptureType = "snapshot" | "full";

export function validateHandState(
  captureType: CaptureType,
  handState: unknown
): HandStateV1 {
  if (captureType === "snapshot") {
    return snapshotHandStateSchema.parse(handState);
  }
  return fullHandStateSchema.parse(handState);
}

export function extractPotAmount(
  captureType: CaptureType,
  handState: HandStateV1
): number | undefined {
  if (captureType === "snapshot") {
    return (handState as SnapshotHandState).pot;
  }
  return (handState as FullHandState).result.pot;
}

export function extractNetResult(
  captureType: CaptureType,
  handState: HandStateV1,
  heroSeat?: number
): number | undefined {
  if (captureType === "snapshot") {
    const snapshot = handState as SnapshotHandState;
    if (snapshot.netResult !== undefined) {
      return snapshot.netResult;
    }
    if (snapshot.outcome === "won") return snapshot.pot;
    if (snapshot.outcome === "lost") return -snapshot.pot;
    return 0;
  }

  const full = handState as FullHandState;
  if (heroSeat === undefined) {
    return undefined;
  }
  const heroWon = full.result.winnerSeats.includes(heroSeat);
  if (heroWon) {
    return full.result.pot;
  }
  return -full.result.pot;
}

export function isSnapshotState(
  handState: HandStateV1
): handState is SnapshotHandState {
  return "heroCards" in handState;
}

export function isFullHandState(
  handState: HandStateV1
): handState is FullHandState {
  return "variant" in handState;
}
