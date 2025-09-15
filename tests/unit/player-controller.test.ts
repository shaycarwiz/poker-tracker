import { Request, Response } from "express";
import { PlayerController } from "@/api/controllers/player-controller";
import { PlayerService } from "@/application/services/player-service";

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
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

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

      mockRequest.body = requestBody;
      mockPlayerService.createPlayer.mockResolvedValue(mockServiceResponse);

      await playerController.createPlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        initialBankroll: {
          amount: 1000,
          currency: "USD",
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
          currency: "USD",
        },
        createdAt: new Date(),
      };

      mockRequest.body = requestBody;
      mockPlayerService.createPlayer.mockResolvedValue(mockServiceResponse);

      await playerController.createPlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPlayerService.createPlayer).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: undefined,
        initialBankroll: {
          amount: 0,
          currency: "USD",
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should return 400 for missing name", async () => {
      const requestBody = {
        email: "john@example.com",
      };

      mockRequest.body = requestBody;

      await playerController.createPlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Name is required and must be a string",
      });
      expect(mockPlayerService.createPlayer).not.toHaveBeenCalled();
    });

    it("should return 400 for non-string name", async () => {
      const requestBody = {
        name: 123,
        email: "john@example.com",
      };

      mockRequest.body = requestBody;

      await playerController.createPlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Name is required and must be a string",
      });
      expect(mockPlayerService.createPlayer).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const requestBody = {
        name: "John Doe",
        email: "john@example.com",
      };

      mockRequest.body = requestBody;
      mockPlayerService.createPlayer.mockRejectedValue(
        new Error("Player with this email already exists")
      );

      await playerController.createPlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to create player",
        message: "Player with this email already exists",
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
          currency: "USD",
        },
        totalSessions: 5,
        totalWinnings: {
          amount: 500,
          currency: "USD",
        },
        winRate: 0.6,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: playerId };
      mockPlayerService.getPlayer.mockResolvedValue(mockServiceResponse);

      await playerController.getPlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPlayerService.getPlayer).toHaveBeenCalledWith(playerId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should handle player not found", async () => {
      const playerId = "player-123";

      mockRequest.params = { id: playerId };
      mockPlayerService.getPlayer.mockRejectedValue(
        new Error("Player not found")
      );

      await playerController.getPlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
          currency: "USD",
        },
        updatedAt: new Date(),
      };

      mockRequest.params = { id: playerId };
      mockRequest.body = requestBody;
      mockPlayerService.updatePlayer.mockResolvedValue(mockServiceResponse);

      await playerController.updatePlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPlayerService.updatePlayer).toHaveBeenCalledWith({
        id: playerId,
        name: "John Updated",
        email: "john.updated@example.com",
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should handle update errors", async () => {
      const playerId = "player-123";
      const requestBody = {
        name: "John Updated",
      };

      mockRequest.params = { id: playerId };
      mockRequest.body = requestBody;
      mockPlayerService.updatePlayer.mockRejectedValue(
        new Error("Player not found")
      );

      await playerController.updatePlayer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
              currency: "USD",
            },
            totalSessions: 0,
            totalWinnings: {
              amount: 0,
              currency: "USD",
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

      mockRequest.query = { limit: "10", page: "1" };
      mockPlayerService.getAllPlayers.mockResolvedValue(mockServiceResponse);

      await playerController.getAllPlayers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPlayerService.getAllPlayers).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should handle list players errors", async () => {
      mockRequest.query = {};
      mockPlayerService.getAllPlayers.mockRejectedValue(
        new Error("Database error")
      );

      await playerController.getAllPlayers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
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
        currency: "USD",
      };

      const mockServiceResponse = {
        playerId: playerId,
        newBankroll: {
          amount: 1500,
          currency: "USD",
        },
        addedAmount: {
          amount: 500,
          currency: "USD",
        },
        addedAt: new Date(),
      };

      mockRequest.params = { id: playerId };
      mockRequest.body = requestBody;
      mockPlayerService.addToBankroll.mockResolvedValue(mockServiceResponse);

      await playerController.addToBankroll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPlayerService.addToBankroll).toHaveBeenCalledWith({
        playerId: playerId,
        amount: {
          amount: 500,
          currency: "USD",
        },
        reason: undefined,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockServiceResponse,
      });
    });

    it("should return 400 for missing amount", async () => {
      const playerId = "player-123";
      const requestBody = {
        currency: "USD",
      };

      mockRequest.params = { id: playerId };
      mockRequest.body = requestBody;

      await playerController.addToBankroll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Amount is required and must be a number",
      });
      expect(mockPlayerService.addToBankroll).not.toHaveBeenCalled();
    });

    it("should return 400 for non-number amount", async () => {
      const playerId = "player-123";
      const requestBody = {
        amount: "invalid",
        currency: "USD",
      };

      mockRequest.params = { id: playerId };
      mockRequest.body = requestBody;

      await playerController.addToBankroll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Amount is required and must be a number",
      });
      expect(mockPlayerService.addToBankroll).not.toHaveBeenCalled();
    });

    it("should handle add bankroll errors", async () => {
      const playerId = "player-123";
      const requestBody = {
        amount: 500,
        currency: "USD",
      };

      mockRequest.params = { id: playerId };
      mockRequest.body = requestBody;
      mockPlayerService.addToBankroll.mockRejectedValue(
        new Error("Player not found")
      );

      await playerController.addToBankroll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Player not found",
      });
    });
  });
});
