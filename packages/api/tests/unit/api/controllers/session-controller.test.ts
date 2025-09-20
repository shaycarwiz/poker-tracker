import { SessionController } from "@/api/controllers/SessionController";
import { SessionService } from "@/application/services/session-service";
import { config } from "@/infrastructure";

// Mock dependencies
jest.mock("@/infrastructure/container", () => ({
  container: {
    services: {
      sessions: {} as SessionService,
    },
  },
}));

jest.mock("@/shared/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("SessionController", () => {
  let sessionController: SessionController;
  let mockSessionService: jest.Mocked<SessionService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock session service
    mockSessionService = {
      startSession: jest.fn(),
      endSession: jest.fn(),
      addTransaction: jest.fn(),
      getSession: jest.fn(),
      listSessions: jest.fn(),
      updateSessionNotes: jest.fn(),
    } as any;

    // Mock the container
    const { container } = require("@/infrastructure/container");
    container.services.sessions = mockSessionService;

    sessionController = new SessionController();
  });

  describe("startSession", () => {
    it("should start session successfully", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
        notes: "Test session",
      };

      const mockSessionData = {
        sessionId: "session-123",
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
        notes: "Test session",
        status: "ACTIVE",
        startedAt: new Date(),
      };

      mockSessionService.startSession.mockResolvedValue(mockSessionData);

      const result = await sessionController.startSession(requestBody);

      expect(mockSessionService.startSession).toHaveBeenCalledWith({
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
        notes: "Test session",
      });
      expect(result).toEqual({
        success: true,
        data: mockSessionData,
      });
    });

    it("should return 400 for missing playerId", async () => {
      const requestBody = {
        playerId: "",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
      };

      const result = await sessionController.startSession(requestBody);

      expect(result).toEqual({
        success: false,
        error: "Player ID is required and must be a string",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should return 400 for missing location", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
      };

      const result = await sessionController.startSession(requestBody);

      expect(result).toEqual({
        success: false,
        error: "Location is required and must be a string",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should return 400 for missing stakes", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: undefined as any,
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
      };

      const result = await sessionController.startSession(requestBody);

      expect(result).toEqual({
        success: false,
        error: "Stakes with smallBlind and bigBlind are required",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should return 400 for missing initialBuyIn amount", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: {
          amount: undefined as any,
          currency: config.poker.defaultCurrency,
        },
      };

      const result = await sessionController.startSession(requestBody);

      expect(result).toEqual({
        success: false,
        error: "Initial buy-in amount is required and must be a number",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
      };

      mockSessionService.startSession.mockRejectedValue(
        new Error("Player not found")
      );

      const result = await sessionController.startSession(requestBody);

      expect(result).toEqual({
        success: false,
        error: "Failed to start session",
        message: "Player not found",
      });
    });
  });

  describe("endSession", () => {
    it("should end session successfully", async () => {
      const sessionId = "session-123";
      const requestBody = {
        finalCashOut: { amount: 150, currency: config.poker.defaultCurrency },
        notes: "Ended session",
      };

      const mockSessionData = {
        sessionId: sessionId,
        playerId: "player-123",
        finalCashOut: { amount: 150, currency: config.poker.defaultCurrency },
        profitLoss: { amount: 50, currency: config.poker.defaultCurrency },
        duration: 150, // in minutes
        status: "COMPLETED",
        endedAt: new Date(),
      };

      mockSessionService.endSession.mockResolvedValue(mockSessionData);

      const result = await sessionController.endSession(sessionId, requestBody);

      expect(mockSessionService.endSession).toHaveBeenCalledWith({
        sessionId,
        finalCashOut: { amount: 150, currency: config.poker.defaultCurrency },
        notes: "Ended session",
      });
      expect(result).toEqual({
        success: true,
        data: mockSessionData,
      });
    });

    it("should return 400 for missing finalCashOut amount", async () => {
      const sessionId = "session-123";
      const requestBody = {
        finalCashOut: {
          amount: undefined as any,
          currency: config.poker.defaultCurrency,
        },
      };

      const result = await sessionController.endSession(sessionId, requestBody);

      expect(result).toEqual({
        success: false,
        error: "Final cash out amount is required and must be a number",
      });
      expect(mockSessionService.endSession).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        finalCashOut: { amount: 150, currency: config.poker.defaultCurrency },
      };

      mockSessionService.endSession.mockRejectedValue(new Error("test error"));

      const result = await sessionController.endSession(sessionId, requestBody);

      expect(result).toEqual({
        success: false,
        error: "Failed to end session",
        message: "test error",
      });
    });
  });

  describe("addTransaction", () => {
    it("should add transaction successfully", async () => {
      const sessionId = "session-123";
      const requestBody = {
        type: "BUY_IN",
        amount: { amount: 50, currency: config.poker.defaultCurrency },
        notes: "Additional buy-in",
      };

      const mockTransactionData = {
        transactionId: "transaction-123",
        sessionId,
        type: "BUY_IN",
        amount: { amount: 50, currency: config.poker.defaultCurrency },
        description: "Additional buy-in",
        addedAt: new Date(),
      };

      mockSessionService.addTransaction.mockResolvedValue(mockTransactionData);

      const result = await sessionController.addTransaction(
        sessionId,
        requestBody
      );

      expect(mockSessionService.addTransaction).toHaveBeenCalledWith({
        sessionId,
        type: "BUY_IN",
        amount: { amount: 50, currency: config.poker.defaultCurrency },
        description: "Additional buy-in",
      });
      expect(result).toEqual({
        success: true,
        data: mockTransactionData,
      });
    });

    it("should return 400 for missing type", async () => {
      const sessionId = "session-123";
      const requestBody = {
        type: "",
        amount: { amount: 50, currency: config.poker.defaultCurrency },
      };

      const result = await sessionController.addTransaction(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Transaction type is required and must be a string",
      });
      expect(mockSessionService.addTransaction).not.toHaveBeenCalled();
    });

    it("should return 400 for missing amount", async () => {
      const sessionId = "session-123";
      const requestBody = {
        type: "BUY_IN",
        amount: {
          amount: undefined as any,
          currency: config.poker.defaultCurrency,
        },
      };

      const result = await sessionController.addTransaction(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Amount is required and must be a number",
      });
      expect(mockSessionService.addTransaction).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        type: "BUY_IN",
        amount: { amount: 50, currency: config.poker.defaultCurrency },
      };

      mockSessionService.addTransaction.mockRejectedValue(
        new Error("Session not active")
      );

      const result = await sessionController.addTransaction(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Failed to add transaction",
        message: "Session not active",
      });
    });
  });

  describe("getSession", () => {
    it("should get session successfully", async () => {
      const sessionId = "session-123";
      const mockSessionData = {
        sessionId: sessionId,
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: config.poker.defaultCurrency,
        },
        initialBuyIn: { amount: 100, currency: config.poker.defaultCurrency },
        currentCashOut: { amount: 0, currency: config.poker.defaultCurrency },
        profitLoss: { amount: 0, currency: config.poker.defaultCurrency },
        status: "ACTIVE",
        notes: "Test session",
        transactions: [],
        startedAt: new Date(),
        endedAt: undefined,
        duration: undefined,
      };

      mockSessionService.getSession.mockResolvedValue(mockSessionData);

      const result = await sessionController.getSession(sessionId);

      expect(mockSessionService.getSession).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual({
        success: true,
        data: mockSessionData,
      });
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";

      mockSessionService.getSession.mockRejectedValue(new Error("test error"));

      const result = await sessionController.getSession(sessionId);

      expect(result).toEqual({
        success: false,
        error: "Failed to get session",
        message: "test error",
      });
    });
  });

  describe("listSessions", () => {
    it("should list sessions successfully", async () => {
      const playerId = "player-123";
      const mockSessionData = {
        sessions: [
          {
            sessionId: "session-123",
            playerId,
            location: "Casino Royale",
            stakes: {
              smallBlind: 1,
              bigBlind: 2,
              currency: config.poker.defaultCurrency,
            },
            initialBuyIn: {
              amount: 100,
              currency: config.poker.defaultCurrency,
            },
            currentCashOut: {
              amount: 150,
              currency: config.poker.defaultCurrency,
            },
            profitLoss: { amount: 50, currency: "USD" },
            status: "COMPLETED",
            notes: "Test session",
            transactions: [],
            startedAt: new Date(),
            endedAt: new Date(),
            duration: 120,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockSessionService.listSessions.mockResolvedValue(mockSessionData);

      const result = await sessionController.listSessions(
        playerId,
        undefined,
        1,
        10
      );

      expect(mockSessionService.listSessions).toHaveBeenCalledWith({
        playerId,
        status: undefined,
        page: 1,
        limit: 10,
        startDate: undefined,
        endDate: undefined,
      });
      expect(result).toEqual({
        success: true,
        data: mockSessionData,
      });
    });

    it("should handle service errors", async () => {
      const playerId = "player-123";

      mockSessionService.listSessions.mockRejectedValue(
        new Error("Database error")
      );

      const result = await sessionController.listSessions(
        playerId,
        undefined,
        1,
        10
      );

      expect(result).toEqual({
        success: false,
        error: "Failed to list sessions",
        message: "Database error",
      });
    });
  });

  describe("cancelSession", () => {
    it("should cancel session successfully", async () => {
      const sessionId = "session-123";
      const requestBody = {
        reason: "Emergency",
      };

      const mockSessionData = {
        sessionId: sessionId,
        playerId: "player-123",
        finalCashOut: { amount: 0, currency: config.poker.defaultCurrency },
        profitLoss: { amount: 0, currency: config.poker.defaultCurrency },
        duration: 0,
        status: "CANCELLED",
        endedAt: new Date(),
      };

      mockSessionService.endSession.mockResolvedValue(mockSessionData);

      const result = await sessionController.cancelSession(
        sessionId,
        requestBody
      );

      expect(mockSessionService.endSession).toHaveBeenCalledWith({
        sessionId,
        finalCashOut: { amount: 0, currency: config.poker.defaultCurrency },
        notes: "Emergency",
      });
      expect(result).toEqual({
        success: true,
        data: mockSessionData,
      });
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        reason: "Emergency",
      };

      mockSessionService.endSession.mockRejectedValue(new Error("test error"));

      const result = await sessionController.cancelSession(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Failed to cancel session",
        message: "test error",
      });
    });
  });

  describe("updateSessionNotes", () => {
    it("should update session notes successfully", async () => {
      const sessionId = "session-123";
      const requestBody = {
        notes: "Updated notes",
      };

      const mockResponseData = {
        sessionId: sessionId,
        notes: "Updated notes",
        updatedAt: new Date(),
      };

      mockSessionService.updateSessionNotes.mockResolvedValue(mockResponseData);

      const result = await sessionController.updateSessionNotes(
        sessionId,
        requestBody
      );

      expect(mockSessionService.updateSessionNotes).toHaveBeenCalledWith({
        sessionId,
        notes: "Updated notes",
      });
      expect(result).toEqual({
        success: true,
        data: mockResponseData,
      });
    });

    it("should return 400 for missing notes", async () => {
      const sessionId = "session-123";
      const requestBody = { notes: "" };

      const result = await sessionController.updateSessionNotes(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Notes are required and must be a string",
      });
      expect(mockSessionService.updateSessionNotes).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid notes type", async () => {
      const sessionId = "session-123";
      const requestBody = {
        notes: 123 as any,
      };

      const result = await sessionController.updateSessionNotes(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Notes are required and must be a string",
      });
      expect(mockSessionService.updateSessionNotes).not.toHaveBeenCalled();
    });

    it("should return 404 for session not found", async () => {
      const sessionId = "session-123";
      const requestBody = {
        notes: "Updated notes",
      };

      mockSessionService.updateSessionNotes.mockRejectedValue(
        new Error("Session not found")
      );

      const result = await sessionController.updateSessionNotes(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Session not found",
      });
    });

    it("should return 400 for session not active", async () => {
      const sessionId = "session-123";
      const requestBody = {
        notes: "Updated notes",
      };

      mockSessionService.updateSessionNotes.mockRejectedValue(
        new Error("Session is not active")
      );

      const result = await sessionController.updateSessionNotes(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Session is not active",
      });
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        notes: "Updated notes",
      };

      mockSessionService.updateSessionNotes.mockRejectedValue(
        new Error("Database error")
      );

      const result = await sessionController.updateSessionNotes(
        sessionId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Failed to update session notes",
        message: "Database error",
      });
    });
  });
});
