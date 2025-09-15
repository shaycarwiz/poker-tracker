import { Request, Response } from "express";
import { SessionController } from "@/api/controllers/session-controller";
import { SessionService } from "@/application/services/session-service";

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
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

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
    } as any;

    // Mock the container
    const { container } = require("@/infrastructure/container");
    container.services.sessions = mockSessionService;

    sessionController = new SessionController();

    // Create mock request and response
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("startSession", () => {
    it("should start session successfully", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        notes: "Test session",
      };

      const mockSessionData = {
        sessionId: "session-123",
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: "USD",
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        notes: "Test session",
        status: "ACTIVE",
        startedAt: new Date(),
      };

      mockRequest.body = requestBody;
      mockSessionService.startSession.mockResolvedValue(mockSessionData);

      await sessionController.startSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSessionService.startSession).toHaveBeenCalledWith({
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
          currency: "USD",
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        notes: "Test session",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionData,
      });
    });

    it("should return 400 for missing playerId", async () => {
      const requestBody = {
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      mockRequest.body = requestBody;

      await sessionController.startSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Player ID is required and must be a string",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should return 400 for missing location", async () => {
      const requestBody = {
        playerId: "player-123",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      mockRequest.body = requestBody;

      await sessionController.startSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Location is required and must be a string",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should return 400 for missing stakes", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      mockRequest.body = requestBody;

      await sessionController.startSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Stakes with smallBlind and bigBlind are required",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should return 400 for missing initialBuyIn amount", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { currency: "USD" },
      };

      mockRequest.body = requestBody;

      await sessionController.startSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Initial buy-in amount is required and must be a number",
      });
      expect(mockSessionService.startSession).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const requestBody = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      mockRequest.body = requestBody;
      mockSessionService.startSession.mockRejectedValue(
        new Error("Player not found")
      );

      await sessionController.startSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to start session",
        message: "Player not found",
      });
    });
  });

  describe("endSession", () => {
    it("should end session successfully", async () => {
      const sessionId = "session-123";
      const requestBody = {
        finalCashOut: { amount: 150, currency: "USD" },
        notes: "Ended session",
      };

      const mockSessionData = {
        sessionId: sessionId,
        playerId: "player-123",
        finalCashOut: { amount: 150, currency: "USD" },
        profitLoss: { amount: 50, currency: "USD" },
        duration: 150, // in minutes
        status: "COMPLETED",
        endedAt: new Date(),
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.endSession.mockResolvedValue(mockSessionData);

      await sessionController.endSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSessionService.endSession).toHaveBeenCalledWith({
        sessionId,
        finalCashOut: { amount: 150, currency: "USD" },
        notes: "Ended session",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionData,
      });
    });

    it("should return 400 for missing finalCashOut amount", async () => {
      const sessionId = "session-123";
      const requestBody = {
        finalCashOut: { currency: "USD" },
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;

      await sessionController.endSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Final cash out amount is required and must be a number",
      });
      expect(mockSessionService.endSession).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        finalCashOut: { amount: 150, currency: "USD" },
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.endSession.mockRejectedValue(new Error("test error"));

      await sessionController.endSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
        amount: { amount: 50, currency: "USD" },
        notes: "Additional buy-in",
      };

      const mockTransactionData = {
        transactionId: "transaction-123",
        sessionId,
        type: "BUY_IN",
        amount: { amount: 50, currency: "USD" },
        description: "Additional buy-in",
        addedAt: new Date(),
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.addTransaction.mockResolvedValue(mockTransactionData);

      await sessionController.addTransaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSessionService.addTransaction).toHaveBeenCalledWith({
        sessionId,
        type: "BUY_IN",
        amount: { amount: 50, currency: "USD" },
        description: "Additional buy-in",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTransactionData,
      });
    });

    it("should return 400 for missing type", async () => {
      const sessionId = "session-123";
      const requestBody = {
        amount: { amount: 50, currency: "USD" },
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;

      await sessionController.addTransaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Transaction type is required and must be a string",
      });
      expect(mockSessionService.addTransaction).not.toHaveBeenCalled();
    });

    it("should return 400 for missing amount", async () => {
      const sessionId = "session-123";
      const requestBody = {
        type: "BUY_IN",
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;

      await sessionController.addTransaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Amount is required and must be a number",
      });
      expect(mockSessionService.addTransaction).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        type: "BUY_IN",
        amount: { amount: 50, currency: "USD" },
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.addTransaction.mockRejectedValue(
        new Error("Session not active")
      );

      await sessionController.addTransaction(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
          currency: "USD",
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        currentCashOut: { amount: 0, currency: "USD" },
        profitLoss: { amount: 0, currency: "USD" },
        status: "ACTIVE",
        notes: "Test session",
        transactions: [],
        startedAt: new Date(),
        endedAt: undefined,
        duration: undefined,
      };

      mockRequest.params = { id: sessionId };
      mockSessionService.getSession.mockResolvedValue(mockSessionData);

      await sessionController.getSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSessionService.getSession).toHaveBeenCalledWith(sessionId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionData,
      });
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";

      mockRequest.params = { id: sessionId };
      mockSessionService.getSession.mockRejectedValue(new Error("test error"));

      await sessionController.getSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
              currency: "USD",
            },
            initialBuyIn: { amount: 100, currency: "USD" },
            currentCashOut: { amount: 150, currency: "USD" },
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

      mockRequest.query = { playerId, limit: "10", offset: "0" };
      mockSessionService.listSessions.mockResolvedValue(mockSessionData);

      await sessionController.listSessions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSessionService.listSessions).toHaveBeenCalledWith({
        playerId,
        limit: 10,
        page: 1,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionData,
      });
    });

    it("should handle service errors", async () => {
      const playerId = "player-123";

      mockRequest.query = { playerId };
      mockSessionService.listSessions.mockRejectedValue(
        new Error("Database error")
      );

      await sessionController.listSessions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
        finalCashOut: { amount: 0, currency: "USD" },
        profitLoss: { amount: 0, currency: "USD" },
        duration: 0,
        status: "CANCELLED",
        endedAt: new Date(),
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.endSession.mockResolvedValue(mockSessionData);

      await sessionController.cancelSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSessionService.endSession).toHaveBeenCalledWith({
        sessionId,
        finalCashOut: { amount: 0, currency: "USD" },
        notes: "Emergency",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSessionData,
      });
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        reason: "Emergency",
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.endSession.mockRejectedValue(new Error("test error"));

      await sessionController.cancelSession(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
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

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.getSession.mockResolvedValue({
        id: sessionId,
        playerId: "player-123",
        status: "ACTIVE",
      } as any);

      await sessionController.updateSessionNotes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Session notes updated successfully",
      });
    });

    it("should return 400 for missing notes", async () => {
      const sessionId = "session-123";
      const requestBody = {};

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;

      await sessionController.updateSessionNotes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Notes are required",
      });
    });

    it("should handle service errors", async () => {
      const sessionId = "session-123";
      const requestBody = {
        notes: "Updated notes",
      };

      mockRequest.params = { id: sessionId };
      mockRequest.body = requestBody;
      mockSessionService.getSession.mockRejectedValue(new Error("test error"));

      await sessionController.updateSessionNotes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to update session notes",
        message: "test error",
      });
    });
  });
});
