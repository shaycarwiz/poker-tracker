import { PlayerService } from "@/application/services/player-service";
import { Player, PlayerId } from "@/model/entities";
import { Money } from "@/model/value-objects";
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

    playerService = new PlayerService(mockPlayerRepository, mockUnitOfWork);
  });

  describe("createPlayer", () => {
    it("should create player successfully", async () => {
      const name = "John Doe";
      const email = "john@example.com";
      const initialBankroll = new Money(1000, "USD");

      mockPlayerRepository.findByEmail.mockResolvedValue(null);
      mockPlayerRepository.save.mockResolvedValue(undefined);

      const result = await playerService.createPlayer(
        name,
        email,
        initialBankroll
      );

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockPlayerRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockPlayerRepository.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Player);
      expect(result.name).toBe(name);
      expect(result.email).toBe(email);
    });

    it("should create player without email", async () => {
      const name = "John Doe";

      mockPlayerRepository.save.mockResolvedValue(undefined);

      const result = await playerService.createPlayer(name);

      expect(mockPlayerRepository.findByEmail).not.toHaveBeenCalled();
      expect(result.name).toBe(name);
      expect(result.email).toBeUndefined();
    });

    it("should throw error if email already exists", async () => {
      const name = "John Doe";
      const email = "john@example.com";
      const existingPlayer = Player.create("Existing Player", email);

      mockPlayerRepository.findByEmail.mockResolvedValue(existingPlayer);

      await expect(playerService.createPlayer(name, email)).rejects.toThrow(
        "Player with this email already exists"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });

    it("should rollback on error", async () => {
      const name = "John Doe";

      mockPlayerRepository.save.mockRejectedValue(new Error("Database error"));

      await expect(playerService.createPlayer(name)).rejects.toThrow(
        "Database error"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("getPlayerById", () => {
    it("should return player if found", async () => {
      const playerId = PlayerId.generate();
      const player = Player.create("John Doe");

      mockPlayerRepository.findById.mockResolvedValue(player);

      const result = await playerService.getPlayerById(playerId);

      expect(mockPlayerRepository.findById).toHaveBeenCalledWith(playerId);
      expect(result).toBe(player);
    });

    it("should return null if player not found", async () => {
      const playerId = PlayerId.generate();

      mockPlayerRepository.findById.mockResolvedValue(null);

      const result = await playerService.getPlayerById(playerId);

      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      const playerId = PlayerId.generate();

      mockPlayerRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(playerService.getPlayerById(playerId)).rejects.toThrow(
        "Failed to get player"
      );
    });
  });
});
