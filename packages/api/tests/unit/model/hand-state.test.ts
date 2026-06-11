import {
  validateHandState,
  snapshotHandStateSchema,
  fullHandStateSchema,
} from "@/model/hand-state";

describe("hand-state validation", () => {
  it("validates snapshot hand state", () => {
    const state = {
      schemaVersion: 1,
      heroCards: ["Ah", "Kd"],
      board: ["7c", "2h", "Ks"],
      pot: 120,
      outcome: "won" as const,
    };

    const result = validateHandState("snapshot", state);
    expect(result).toEqual(state);
    expect(snapshotHandStateSchema.parse(state)).toEqual(state);
  });

  it("rejects invalid card notation", () => {
    expect(() =>
      validateHandState("snapshot", {
        schemaVersion: 1,
        heroCards: ["XX"],
        board: [],
        pot: 10,
        outcome: "won",
      })
    ).toThrow();
  });

  it("validates full hand state", () => {
    const state = {
      schemaVersion: 1,
      variant: "NLH" as const,
      buttonSeat: 1,
      players: [
        { seat: 1, name: "Hero", stack: 200, holeCards: ["Ah", "Kd"] },
        { seat: 2, name: "Villain", stack: 150, holeCards: null },
      ],
      streets: [
        {
          name: "preflop" as const,
          board: [],
          actions: [{ seat: 1, type: "raise" as const, amount: 8 }],
        },
      ],
      result: { winnerSeats: [1], pot: 16 },
    };

    const result = validateHandState("full", state);
    expect(result).toEqual(state);
    expect(fullHandStateSchema.parse(state)).toEqual(state);
  });
});
