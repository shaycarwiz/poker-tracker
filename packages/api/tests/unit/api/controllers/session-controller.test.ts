import { SessionController } from "@/api/controllers/SessionController";
import { SessionService } from "@/application/services/session-service";
import { UserService } from "@/application/services/user-service";
import { config } from "@/infrastructure";
import { AuthenticatedRequest } from "@/api/middleware/auth";

jest.mock("@/shared/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockAuthRequest = {
  user: {
    userId: "user-123",
    googleId: "google-123",
    email: "test@example.com",
    name: "Test User",
  },
} as AuthenticatedRequest;

describe("SessionController", () => {
  let sessionController: SessionController;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSessionService = {
      startSession: jest.fn(),
      endSession: jest.fn(),
      addTransaction: jest.fn(),
      getSession: jest.fn(),
      listSessions: jest.fn(),
      updateSessionNotes: jest.fn(),
      getActiveSession: jest.fn(),
    } as any;

    mockUserService = {
      getProfile: jest.fn().mockResolvedValue({
        id: "user-123",
        defaultPlayerId: "player-123",
      }),
    } as any;

    sessionController = new SessionController(
      mockSessionService,
      mockUserService
    );
  });

  describe("startSession", () => {
    it("should start session successfully", async () => {
      const requestBody = {
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
        userId: "user-123",
        location: "Casino Royale",
        stakes: requestBody.stakes,
        initialBuyIn: requestBody.initialBuyIn,
        notes: "Test session",
        status: "ACTIVE",
        startedAt: new Date(),
      };

      mockSessionService.startSession.mockResolvedValue(mockSessionData);

      const result = await sessionController.startSession(
        mockAuthRequest,
        requestBody
      );

      expect(mockSessionService.startSession).toHaveBeenCalledWith({
        userId: "user-123",
        location: requestBody.location,
        stakes: requestBody.stakes,
        initialBuyIn: requestBody.initialBuyIn,
        notes: requestBody.notes,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSessionData);
    });
  });

  describe("addTransaction", () => {
    it("should add transaction with playerId", async () => {
      mockSessionService.addTransaction.mockResolvedValue({
        transactionId: "txn-1",
        sessionId: "session-123",
        playerId: "player-123",
        type: "buy_in",
        amount: { amount: 50, currency: "USD" },
        addedAt: new Date(),
      });

      const result = await sessionController.addTransaction(
        mockAuthRequest,
        "session-123",
        {
          playerId: "player-123",
          type: "buy_in",
          amount: { amount: 50, currency: "USD" },
        }
      );

      expect(result.success).toBe(true);
      expect(mockSessionService.addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          playerId: "player-123",
        })
      );
    });
  });

  describe("listSessions", () => {
    it("should list sessions for authenticated user", async () => {
      mockSessionService.listSessions.mockResolvedValue({
        sessions: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const result = await sessionController.listSessions(mockAuthRequest);

      expect(result.success).toBe(true);
      expect(mockSessionService.listSessions).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-123" })
      );
    });
  });
});
