import { PlayerController } from "@/api/controllers/PlayerController";
import { PlayerService } from "@/application/services/player-service";
import { config } from "@/infrastructure";

// Mock dependencies
jest.mock("@/infrastructure/container", () => ({
  container: {
    services: {
      players: {} as PlayerService,
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

describe("PlayerController", () => {
  let playerController: PlayerController;
  let mockPlayerService: jest.Mocked<PlayerService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock player service
    mockPlayerService = {
      createPlayer: jest.fn(),
      getPlayer: jest.fn(),
      updatePlayer: jest.fn(),
      getAllPlayers: jest.fn(),
      addToBankroll: jest.fn(),
    } as any;

    // Mock the container
    const { container } = require("@/infrastructure/container");
    container.services.players = mockPlayerService;

    playerController = new PlayerController();
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

      const result = await playerController.createPlayer(requestBody);

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith({
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

      const result = await playerController.createPlayer(requestBody);

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith({
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

      const result = await playerController.createPlayer(requestBody);

      expect(result).toEqual({
        success: false,
        error: "VALIDATION_NAME_REQUIRED",
        code: "VALIDATION_NAME_REQUIRED",
        statusCode: 400,
        details: undefined,
      });
      expect(mockPlayerService.createPlayer).not.toHaveBeenCalled();
    });

    it("should return 400 for non-string name", async () => {
      const requestBody = {
        name: 123 as any,
        email: "john@example.com",
      };

      const result = await playerController.createPlayer(requestBody);

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
        new Error("Player with this email already exists")
      );

      const result = await playerController.createPlayer(requestBody);

      expect(result).toEqual({
        success: false,
        error: "API_CREATE_PLAYER_FAILED",
        code: "API_CREATE_PLAYER_FAILED",
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

      const result = await playerController.getPlayer(playerId);

      expect(mockPlayerService.getPlayer).toHaveBeenCalledWith(playerId);
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

      const result = await playerController.getPlayer(playerId);

      expect(result).toEqual({
        success: false,
        error: "BUSINESS_PLAYER_NOT_FOUND",
        code: "BUSINESS_PLAYER_NOT_FOUND",
        statusCode: 404,
        details: undefined,
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

      const result = await playerController.updatePlayer(playerId, requestBody);

      expect(mockPlayerService.updatePlayer).toHaveBeenCalledWith({
        id: playerId,
        name: "John Updated",
        email: "john.updated@example.com",
      });
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should handle update errors", async () => {
      const playerId = "player-123";
      const requestBody = {
        name: "John Updated",
      };

      mockPlayerService.updatePlayer.mockRejectedValue(
        new Error("Player not found")
      );

      const result = await playerController.updatePlayer(playerId, requestBody);

      expect(result).toEqual({
        success: false,
        error: "Player not found",
      });
    });
  });

  describe("getAllPlayers", () => {
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

      mockPlayerService.getAllPlayers.mockResolvedValue(mockServiceResponse);

      const result = await playerController.getAllPlayers(1, 10);

      expect(mockPlayerService.getAllPlayers).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should handle list players errors", async () => {
      mockPlayerService.getAllPlayers.mockRejectedValue(
        new Error("Database error")
      );

      const result = await playerController.getAllPlayers(1, 10);

      expect(result).toEqual({
        success: false,
        error: "Failed to get players",
        message: "Database error",
      });
    });
  });

  describe("addToBankroll", () => {
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

      const result = await playerController.addToBankroll(
        playerId,
        requestBody
      );

      expect(mockPlayerService.addToBankroll).toHaveBeenCalledWith({
        playerId: playerId,
        amount: {
          amount: 500,
          currency: config.poker.defaultCurrency,
        },
        reason: undefined,
      });
      expect(result).toEqual({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should return 400 for missing amount", async () => {
      const playerId = "player-123";
      const requestBody = {
        amount: undefined as any,
        currency: config.poker.defaultCurrency,
      };

      const result = await playerController.addToBankroll(
        playerId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Amount is required and must be a number",
      });
      expect(mockPlayerService.addToBankroll).not.toHaveBeenCalled();
    });

    it("should return 400 for non-number amount", async () => {
      const playerId = "player-123";
      const requestBody = {
        amount: "invalid" as any,
        currency: config.poker.defaultCurrency,
      };

      const result = await playerController.addToBankroll(
        playerId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Amount is required and must be a number",
      });
      expect(mockPlayerService.addToBankroll).not.toHaveBeenCalled();
    });

    it("should handle add bankroll errors", async () => {
      const playerId = "player-123";
      const requestBody = {
        amount: 500,
        currency: config.poker.defaultCurrency,
      };

      mockPlayerService.addToBankroll.mockRejectedValue(
        new Error("Player not found")
      );

      const result = await playerController.addToBankroll(
        playerId,
        requestBody
      );

      expect(result).toEqual({
        success: false,
        error: "Player not found",
      });
    });
  });
});
