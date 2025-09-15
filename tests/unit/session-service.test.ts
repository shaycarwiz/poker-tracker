import { SessionService } from "@/application/services/session-service";
import { UnitOfWork } from "@/model/repositories";

// Mock dependencies
jest.mock("@/shared/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("SessionService", () => {
  let sessionService: SessionService;
  let mockUnitOfWork: jest.Mocked<UnitOfWork>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mocks
    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      players: {} as any,
      sessions: {} as any,
      transactions: {} as any,
    } as any;

    sessionService = new SessionService(mockUnitOfWork);
  });

  describe("startSession", () => {
    it("should start session successfully", async () => {
      const request = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: "USD",
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        notes: "Test session",
      };

      const mockResponse = {
        id: "session-123",
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        buyIn: { amount: 100, currency: "USD" },
        notes: "Test session",
        status: "ACTIVE",
        startTime: new Date(),
        transactions: [],
      };

      // Mock the use case
      const mockStartSessionUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (sessionService as any).startSessionUseCase = mockStartSessionUseCase;

      const result = await sessionService.startSession(request);

      expect(mockStartSessionUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    it("should handle start session errors", async () => {
      const request = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: "USD",
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      const mockStartSessionUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Player not found")),
      };
      (sessionService as any).startSessionUseCase = mockStartSessionUseCase;

      await expect(sessionService.startSession(request)).rejects.toThrow(
        "Player not found"
      );
    });
  });

  describe("endSession", () => {
    it("should end session successfully", async () => {
      const request = {
        sessionId: "session-123",
        finalCashOut: { amount: 150, currency: "USD" },
        notes: "Ended session",
      };

      const mockResponse = {
        id: "session-123",
        playerId: "player-123",
        status: "COMPLETED",
        startTime: new Date(),
        endTime: new Date(),
        netResult: { amount: 50, currency: "USD" },
        duration: { hours: 2.5 },
        totalBuyIn: { amount: 100, currency: "USD" },
        totalCashOut: { amount: 150, currency: "USD" },
      };

      const mockEndSessionUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (sessionService as any).endSessionUseCase = mockEndSessionUseCase;

      const result = await sessionService.endSession(request);

      expect(mockEndSessionUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    it("should handle end session errors", async () => {
      const request = {
        sessionId: "session-123",
        finalCashOut: { amount: 150, currency: "USD" },
      };

      const mockEndSessionUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Session not found")),
      };
      (sessionService as any).endSessionUseCase = mockEndSessionUseCase;

      await expect(sessionService.endSession(request)).rejects.toThrow(
        "Session not found"
      );
    });
  });

  describe("addTransaction", () => {
    it("should add transaction successfully", async () => {
      const request = {
        sessionId: "session-123",
        type: "BUY_IN",
        amount: { amount: 50, currency: "USD" },
        notes: "Additional buy-in",
      };

      const mockResponse = {
        id: "transaction-123",
        sessionId: "session-123",
        playerId: "player-123",
        type: "BUY_IN",
        amount: { amount: 50, currency: "USD" },
        timestamp: new Date(),
        notes: "Additional buy-in",
      };

      const mockAddTransactionUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (sessionService as any).addTransactionUseCase = mockAddTransactionUseCase;

      const result = await sessionService.addTransaction(request);

      expect(mockAddTransactionUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    it("should handle add transaction errors", async () => {
      const request = {
        sessionId: "session-123",
        type: "BUY_IN",
        amount: { amount: 50, currency: "USD" },
      };

      const mockAddTransactionUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Session not active")),
      };
      (sessionService as any).addTransactionUseCase = mockAddTransactionUseCase;

      await expect(sessionService.addTransaction(request)).rejects.toThrow(
        "Session not active"
      );
    });
  });

  describe("getSession", () => {
    it("should get session successfully", async () => {
      const sessionId = "session-123";
      const mockResponse = {
        id: "session-123",
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        status: "ACTIVE",
        startTime: new Date(),
        transactions: [],
        totalBuyIn: { amount: 100, currency: "USD" },
        totalCashOut: { amount: 0, currency: "USD" },
        netResult: { amount: 0, currency: "USD" },
      };

      const mockGetSessionUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (sessionService as any).getSessionUseCase = mockGetSessionUseCase;

      const result = await sessionService.getSession(sessionId);

      expect(mockGetSessionUseCase.execute).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockResponse);
    });

    it("should handle get session errors", async () => {
      const sessionId = "session-123";

      const mockGetSessionUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Session not found")),
      };
      (sessionService as any).getSessionUseCase = mockGetSessionUseCase;

      await expect(sessionService.getSession(sessionId)).rejects.toThrow(
        "Session not found"
      );
    });
  });

  describe("listSessions", () => {
    it("should list sessions successfully", async () => {
      const request = {
        playerId: "player-123",
        limit: 10,
        offset: 0,
      };

      const mockResponse = {
        sessions: [
          {
            id: "session-123",
            playerId: "player-123",
            location: "Casino Royale",
            status: "COMPLETED",
            startTime: new Date(),
            endTime: new Date(),
            netResult: { amount: 50, currency: "USD" },
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      const mockListSessionsUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (sessionService as any).listSessionsUseCase = mockListSessionsUseCase;

      const result = await sessionService.listSessions(request);

      expect(mockListSessionsUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    it("should handle list sessions errors", async () => {
      const request = {
        playerId: "player-123",
        limit: 10,
        offset: 0,
      };

      const mockListSessionsUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Database error")),
      };
      (sessionService as any).listSessionsUseCase = mockListSessionsUseCase;

      await expect(sessionService.listSessions(request)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
