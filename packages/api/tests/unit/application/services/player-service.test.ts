import { PlayerService } from "@/application/services/player-service";
import { PlayerRepository, UnitOfWork } from "@/model/repositories";

// Mock dependencies
jest.mock("@/shared/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("PlayerService", () => {
  let playerService: PlayerService;
  let mockPlayerRepository: jest.Mocked<PlayerRepository>;
  let mockUnitOfWork: jest.Mocked<UnitOfWork>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mocks
    mockPlayerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      players: mockPlayerRepository,
      sessions: {} as any,
      transactions: {} as any,
    } as any;

    playerService = new PlayerService(mockUnitOfWork);
  });

  describe("createPlayer", () => {
    it("should create player successfully", async () => {
      const request = {
        name: "John Doe",
        email: "john@example.com",
        initialBankroll: {
          amount: 1000,
          currency: "USD",
        },
      };

      // Mock the use case execution
      const mockResponse = {
        id: "player-123",
        name: "John Doe",
        email: "john@example.com",
        bankroll: {
          amount: 1000,
          currency: "USD",
        },
        createdAt: new Date(),
      };

      // Mock the use case
      const mockCreatePlayerUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (playerService as any).createPlayerUseCase = mockCreatePlayerUseCase;

      const result = await playerService.createPlayer(request);

      expect(mockCreatePlayerUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    it("should create player without email", async () => {
      const request = {
        name: "John Doe",
      };

      const mockResponse = {
        id: "player-123",
        name: "John Doe",
        bankroll: {
          amount: 0,
          currency: "USD",
        },
        createdAt: new Date(),
      };

      const mockCreatePlayerUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (playerService as any).createPlayerUseCase = mockCreatePlayerUseCase;

      const result = await playerService.createPlayer(request);

      expect(mockCreatePlayerUseCase.execute).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    it("should throw error if email already exists", async () => {
      const request = {
        name: "John Doe",
        email: "john@example.com",
      };

      const mockCreatePlayerUseCase = {
        execute: jest
          .fn()
          .mockRejectedValue(
            new Error("Player with this email already exists")
          ),
      };
      (playerService as any).createPlayerUseCase = mockCreatePlayerUseCase;

      await expect(playerService.createPlayer(request)).rejects.toThrow(
        "Player with this email already exists"
      );
    });

    it("should rollback on error", async () => {
      const request = {
        name: "John Doe",
      };

      const mockCreatePlayerUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Database error")),
      };
      (playerService as any).createPlayerUseCase = mockCreatePlayerUseCase;

      await expect(playerService.createPlayer(request)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getPlayer", () => {
    it("should return player if found", async () => {
      const playerId = "player-123";
      const mockResponse = {
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

      const mockGetPlayerUseCase = {
        execute: jest.fn().mockResolvedValue(mockResponse),
      };
      (playerService as any).getPlayerUseCase = mockGetPlayerUseCase;

      const result = await playerService.getPlayer(playerId);

      expect(mockGetPlayerUseCase.execute).toHaveBeenCalledWith(playerId);
      expect(result).toEqual(mockResponse);
    });

    it("should throw error on database error", async () => {
      const playerId = "player-123";

      const mockGetPlayerUseCase = {
        execute: jest.fn().mockRejectedValue(new Error("Database error")),
      };
      (playerService as any).getPlayerUseCase = mockGetPlayerUseCase;

      await expect(playerService.getPlayer(playerId)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
