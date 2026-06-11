import { PlayerController } from "@/api/controllers/PlayerController";
import { PlayerService } from "@/application/services/player-service";
import { AuthenticatedRequest } from "@/api/middleware/auth";
import { config } from "@/infrastructure";

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

describe("PlayerController", () => {
  let playerController: PlayerController;
  let mockPlayerService: jest.Mocked<PlayerService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPlayerService = {
      createPlayer: jest.fn(),
      getPlayer: jest.fn(),
      getDefaultPlayer: jest.fn(),
      updatePlayer: jest.fn(),
      listPlayersByOwner: jest.fn(),
      addToBankroll: jest.fn(),
    } as any;

    playerController = new PlayerController(mockPlayerService);
  });

  describe("createPlayer", () => {
    it("should create player successfully", async () => {
      const requestBody = {
        name: "John Doe",
        email: "john@example.com",
        initialBankroll: {
          amount: 1000,
          currency: "USD",
        },
      };

      const mockServiceResponse = {
        id: "player-123",
        name: "John Doe",
        email: "john@example.com",
        bankroll: {
          amount: 1000,
          currency: "USD",
        },
        createdAt: new Date(),
      };

      mockPlayerService.createPlayer.mockResolvedValue(mockServiceResponse);

      const result = await playerController.createPlayer(
        mockAuthRequest,
        requestBody
      );

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith({
        ownerUserId: "user-123",
        name: "John Doe",
        email: "john@example.com",
        initialBankroll: {
          amount: 1000,
          currency: "USD",
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should create player without email and initial bankroll", async () => {
      const requestBody = {
        name: "Jane Doe",
      };

      const mockServiceResponse = {
        id: "player-456",
        name: "Jane Doe",
        bankroll: {
          amount: 0,
          currency: config.poker.defaultCurrency,
        },
        createdAt: new Date(),
      };

      mockPlayerService.createPlayer.mockResolvedValue(mockServiceResponse);

      const result = await playerController.createPlayer(
        mockAuthRequest,
        requestBody
      );

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith({
        ownerUserId: "user-123",
        name: "Jane Doe",
        email: undefined,
        initialBankroll: {
          amount: 0,
          currency: config.poker.defaultCurrency,
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should return 400 for missing name", async () => {
      const requestBody = {
        name: "",
        email: "john@example.com",
      };

      const result = await playerController.createPlayer(
        mockAuthRequest,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "VALIDATION_NAME_REQUIRED",
        code: "VALIDATION_NAME_REQUIRED",
        statusCode: 400,
        details: undefined,
      });
      expect(mockPlayerService.createPlayer).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const requestBody = {
        name: "John Doe",
        email: "john@example.com",
      };

      mockPlayerService.createPlayer.mockRejectedValue(
        new Error("Database error")
      );

      const result = await playerController.createPlayer(
        mockAuthRequest,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "DATABASE_PLAYER_SAVE_FAILED",
        code: "DATABASE_PLAYER_SAVE_FAILED",
        statusCode: 500,
        details: undefined,
      });
    });
  });

  describe("getPlayer", () => {
    it("should get player successfully", async () => {
      const playerId = "player-123";
      const mockServiceResponse = {
        id: playerId,
        name: "John Doe",
        email: "john@example.com",
        bankroll: {
          amount: 1000,
          currency: config.poker.defaultCurrency,
        },
        totalSessions: 5,
        totalWinnings: {
          amount: 500,
          currency: config.poker.defaultCurrency,
        },
        winRate: 0.6,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPlayerService.getPlayer.mockResolvedValue(mockServiceResponse);

      const result = await playerController.getPlayer(mockAuthRequest, playerId);

      expect(mockPlayerService.getPlayer).toHaveBeenCalledWith(
        playerId,
        "user-123"
      );
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should handle player not found", async () => {
      const playerId = "player-123";

      mockPlayerService.getPlayer.mockRejectedValue(
        new Error("Player not found")
      );

      const result = await playerController.getPlayer(mockAuthRequest, playerId);

      expect(result).toEqual({
        success: false,
        error: "Player not found",
      });
    });
  });

  describe("updatePlayer", () => {
    it("should update player successfully", async () => {
      const playerId = "player-123";
      const requestBody = {
        name: "John Updated",
        email: "john.updated@example.com",
      };

      const mockServiceResponse = {
        id: playerId,
        name: "John Updated",
        email: "john.updated@example.com",
        bankroll: {
          amount: 1000,
          currency: config.poker.defaultCurrency,
        },
        updatedAt: new Date(),
      };

      mockPlayerService.updatePlayer.mockResolvedValue(mockServiceResponse);

      const result = await playerController.updatePlayer(
        mockAuthRequest,
        playerId,
        requestBody
      );

      expect(mockPlayerService.updatePlayer).toHaveBeenCalledWith({
        id: playerId,
        ownerUserId: "user-123",
        name: "John Updated",
        email: "john.updated@example.com",
      });
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });
  });

  describe("listPlayers", () => {
    it("should list players successfully", async () => {
      const mockServiceResponse = {
        players: [
          {
            id: "player-123",
            name: "John Doe",
            email: "john@example.com",
            bankroll: {
              amount: 1000,
              currency: config.poker.defaultCurrency,
            },
            totalSessions: 0,
            totalWinnings: {
              amount: 0,
              currency: config.poker.defaultCurrency,
            },
            winRate: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockPlayerService.listPlayersByOwner.mockResolvedValue(mockServiceResponse);

      const result = await playerController.listPlayers(
        mockAuthRequest,
        1,
        10
      );

      expect(mockPlayerService.listPlayersByOwner).toHaveBeenCalledWith(
        "user-123",
        1,
        10
      );
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });
  });

  describe("updatePlayerBankroll", () => {
    it("should add bankroll successfully", async () => {
      const playerId = "player-123";
      const requestBody = {
        amount: 500,
        currency: config.poker.defaultCurrency,
      };

      const mockServiceResponse = {
        playerId: playerId,
        newBankroll: {
          amount: 1500,
          currency: config.poker.defaultCurrency,
        },
        addedAmount: {
          amount: 500,
          currency: config.poker.defaultCurrency,
        },
        addedAt: new Date(),
      };

      mockPlayerService.addToBankroll.mockResolvedValue(mockServiceResponse);

      const result = await playerController.updatePlayerBankroll(
        mockAuthRequest,
        playerId,
        requestBody
      );

      expect(mockPlayerService.addToBankroll).toHaveBeenCalledWith({
        playerId: playerId,
        ownerUserId: "user-123",
        amount: {
          amount: 500,
          currency: config.poker.defaultCurrency,
        },
      });
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });
  });
});
