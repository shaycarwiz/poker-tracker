import { Player, Session } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";
import { TransactionType, SessionStatus } from "@/model/enums";
import {
  CreatePlayerUseCase,
  GetPlayerUseCase,
  UpdatePlayerUseCase,
  DeletePlayerUseCase,
  ListPlayersUseCase,
  AddBankrollUseCase,
} from "@/application/use-cases/player-use-cases";
import {
  StartSessionUseCase,
  EndSessionUseCase,
  AddTransactionUseCase,
  GetSessionUseCase,
  ListSessionsUseCase,
} from "@/application/use-cases/session-use-cases";
import { config } from "@/infrastructure";

// Mock dependencies
jest.mock("@/shared/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("Player Use Cases", () => {
  let mockUnitOfWork: any;
  let createPlayerUseCase: CreatePlayerUseCase;
  let getPlayerUseCase: GetPlayerUseCase;
  let updatePlayerUseCase: UpdatePlayerUseCase;
  let deletePlayerUseCase: DeletePlayerUseCase;
  let listPlayersUseCase: ListPlayersUseCase;
  let addBankrollUseCase: AddBankrollUseCase;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock unit of work
    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      players: {
        findById: jest.fn(),
        findByEmail: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn(),
      },
      sessions: {
        findById: jest.fn(),
        save: jest.fn(),
        findByPlayerId: jest.fn().mockResolvedValue([]),
        findActiveByPlayerId: jest.fn(),
        findByFilters: jest.fn(),
      },
      transactions: {
        save: jest.fn(),
      },
    } as any;

    // Create use cases
    createPlayerUseCase = new CreatePlayerUseCase(mockUnitOfWork);
    getPlayerUseCase = new GetPlayerUseCase(mockUnitOfWork);
    updatePlayerUseCase = new UpdatePlayerUseCase(mockUnitOfWork);
    deletePlayerUseCase = new DeletePlayerUseCase(mockUnitOfWork);
    listPlayersUseCase = new ListPlayersUseCase(mockUnitOfWork);
    addBankrollUseCase = new AddBankrollUseCase(mockUnitOfWork);
  });

  describe("CreatePlayerUseCase", () => {
    it("should create player successfully", async () => {
      const request = {
        name: "John Doe",
        email: "john@example.com",
        initialBankroll: {
          amount: 1000,
          currency: "USD",
        },
      };

      mockUnitOfWork.players.findByEmail.mockResolvedValue(null);
      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await createPlayerUseCase.execute(request);

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.players.findByEmail).toHaveBeenCalledWith(
        request.email
      );
      expect(mockUnitOfWork.players.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.name).toBe(request.name);
      expect(result.email).toBe(request.email);
      expect(result.bankroll.amount).toBe(request.initialBankroll.amount);
    });

    it("should create player without email", async () => {
      const request = {
        name: "Jane Doe",
      };

      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await createPlayerUseCase.execute(request);

      expect(mockUnitOfWork.players.findByEmail).not.toHaveBeenCalled();
      expect(mockUnitOfWork.players.save).toHaveBeenCalled();
      expect(result.name).toBe(request.name);
      expect(result.email).toBeUndefined();
      expect(result.bankroll.amount).toBe(0);
    });

    it("should throw error if email already exists", async () => {
      const request = {
        name: "John Doe",
        email: "john@example.com",
      };

      const existingPlayer = Player.create(
        "Existing Player",
        "john@example.com"
      );
      mockUnitOfWork.players.findByEmail.mockResolvedValue(existingPlayer);

      await expect(createPlayerUseCase.execute(request)).rejects.toThrow(
        "Player with this email already exists"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });

    it("should rollback on error", async () => {
      const request = {
        name: "John Doe",
        email: "john@example.com",
      };

      mockUnitOfWork.players.findByEmail.mockRejectedValue(
        new Error("Database error")
      );

      await expect(createPlayerUseCase.execute(request)).rejects.toThrow(
        "Database error"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("GetPlayerUseCase", () => {
    it("should get player successfully", async () => {
      const playerId = "player-123";
      const mockPlayer = Player.create("John Doe", "john@example.com");
      const mockSessions: Session[] = [];

      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.sessions.findByPlayerId = jest
        .fn()
        .mockResolvedValue(mockSessions);

      const result = await getPlayerUseCase.execute(playerId);

      expect(mockUnitOfWork.players.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: playerId })
      );
      expect(result.id).toBe(mockPlayer.id.value);
      expect(result.name).toBe(mockPlayer.name);
    });

    it("should throw error if player not found", async () => {
      const playerId = "player-123";

      mockUnitOfWork.players.findById.mockResolvedValue(null);

      await expect(getPlayerUseCase.execute(playerId)).rejects.toThrow(
        "Player not found"
      );
    });
  });

  describe("UpdatePlayerUseCase", () => {
    it("should update player successfully", async () => {
      const playerId = "player-123";
      const request = {
        name: "John Updated",
        email: "john.updated@example.com",
      };

      const mockPlayer = Player.create("John Doe", "john@example.com");
      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await updatePlayerUseCase.execute({
        id: playerId,
        ...request,
      });

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.players.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: playerId })
      );
      expect(mockUnitOfWork.players.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.name).toBe(request.name);
      expect(result.email).toBe(request.email);
    });

    it("should throw error if player not found", async () => {
      const playerId = "player-123";
      const request = { name: "John Updated" };

      mockUnitOfWork.players.findById.mockResolvedValue(null);

      await expect(
        updatePlayerUseCase.execute({ id: playerId, ...request })
      ).rejects.toThrow("Player not found");

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("DeletePlayerUseCase", () => {
    it("should delete player successfully", async () => {
      const playerId = "player-123";
      const mockPlayer = Player.create("John Doe");

      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.sessions.findByPlayerId.mockResolvedValue([]);
      mockUnitOfWork.players.delete.mockResolvedValue(undefined);

      await deletePlayerUseCase.execute(playerId);

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.players.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: playerId })
      );
      expect(mockUnitOfWork.players.delete).toHaveBeenCalledWith(
        expect.objectContaining({ value: playerId })
      );
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
    });

    it("should throw error if player not found", async () => {
      const playerId = "player-123";

      mockUnitOfWork.players.findById.mockResolvedValue(null);

      await expect(deletePlayerUseCase.execute(playerId)).rejects.toThrow(
        "Player not found"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("ListPlayersUseCase", () => {
    it("should list players successfully", async () => {
      const mockPlayers = [
        Player.create("John Doe", "john@example.com"),
        Player.create("Jane Doe", "jane@example.com"),
      ];

      mockUnitOfWork.players.findAll.mockResolvedValue(mockPlayers);

      const result = await listPlayersUseCase.execute(1, 10);

      expect(mockUnitOfWork.players.findAll).toHaveBeenCalledWith();
      expect(result.players).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe("AddBankrollUseCase", () => {
    it("should add bankroll successfully", async () => {
      const playerId = "player-123";
      const request = {
        amount: 500,
        currency: config.poker.defaultCurrency,
      };

      const mockPlayer = Player.create("John Doe", "john@example.com");
      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await addBankrollUseCase.execute({
        playerId,
        amount: request,
      });

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.players.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: playerId })
      );
      expect(mockUnitOfWork.players.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.newBankroll.amount).toBe(500);
    });

    it("should throw error if player not found", async () => {
      const playerId = "player-123";
      const request = {
        amount: 500,
        currency: "USD",
      };

      mockUnitOfWork.players.findById.mockResolvedValue(null);

      await expect(
        addBankrollUseCase.execute({ playerId, amount: request })
      ).rejects.toThrow("Player not found");

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });
});

describe("Session Use Cases", () => {
  let mockUnitOfWork: any;
  let startSessionUseCase: StartSessionUseCase;
  let endSessionUseCase: EndSessionUseCase;
  let addTransactionUseCase: AddTransactionUseCase;
  let getSessionUseCase: GetSessionUseCase;
  let listSessionsUseCase: ListSessionsUseCase;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock unit of work
    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      players: {
        findById: jest.fn(),
        findByEmail: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn(),
      },
      sessions: {
        findById: jest.fn(),
        save: jest.fn(),
        findByPlayerId: jest.fn().mockResolvedValue([]),
        findActiveByPlayerId: jest.fn(),
        findByFilters: jest.fn(),
      },
      transactions: {
        save: jest.fn(),
      },
    } as any;

    // Create use cases
    startSessionUseCase = new StartSessionUseCase(mockUnitOfWork);
    endSessionUseCase = new EndSessionUseCase(mockUnitOfWork);
    addTransactionUseCase = new AddTransactionUseCase(mockUnitOfWork);
    getSessionUseCase = new GetSessionUseCase(mockUnitOfWork);
    listSessionsUseCase = new ListSessionsUseCase(mockUnitOfWork);
  });

  describe("StartSessionUseCase", () => {
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

      mockUnitOfWork.sessions.findActiveByPlayerId.mockResolvedValue(null);
      mockUnitOfWork.sessions.save.mockResolvedValue(undefined);

      const result = await startSessionUseCase.execute(request);

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.sessions.findActiveByPlayerId).toHaveBeenCalledWith(
        expect.objectContaining({ value: request.playerId })
      );
      expect(mockUnitOfWork.sessions.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.playerId).toBe(request.playerId);
      expect(result.location).toBe(request.location);
    });
  });

  describe("EndSessionUseCase", () => {
    it("should end session successfully", async () => {
      const request = {
        sessionId: "session-123",
        finalCashOut: { amount: 150, currency: config.poker.defaultCurrency },
        notes: "Ended session",
      };

      const mockPlayer = Player.create("John Doe");
      const mockSession = Session.start(
        mockPlayer.id,
        "Casino Royale",
        new Stakes(
          new Money(1, config.poker.defaultCurrency),
          new Money(2, config.poker.defaultCurrency)
        ),
        new Money(100, config.poker.defaultCurrency),
        "Test session"
      );

      mockUnitOfWork.sessions.findById.mockResolvedValue(mockSession);
      mockUnitOfWork.sessions.save.mockResolvedValue(undefined);

      const result = await endSessionUseCase.execute(request);

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.sessions.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: request.sessionId })
      );
      expect(mockUnitOfWork.sessions.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.sessionId).toBe(mockSession.id.value);
      expect(result.status).toBe(SessionStatus.COMPLETED);
    });

    it("should throw error if session not found", async () => {
      const request = {
        sessionId: "session-123",
        finalCashOut: { amount: 150, currency: "USD" },
      };

      mockUnitOfWork.sessions.findById.mockResolvedValue(null);

      await expect(endSessionUseCase.execute(request)).rejects.toThrow(
        "Session not found"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("AddTransactionUseCase", () => {
    it("should add transaction successfully", async () => {
      const request = {
        sessionId: "session-123",
        type: TransactionType.BUY_IN,
        amount: { amount: 50, currency: "USD" },
        notes: "Additional buy-in",
      };

      const mockPlayer = Player.create("John Doe");
      const mockSession = Session.start(
        mockPlayer.id,
        "Casino Royale",
        new Stakes(new Money(1, "USD"), new Money(2, "USD")),
        new Money(100, "USD"),
        "Test session"
      );

      mockUnitOfWork.sessions.findById.mockResolvedValue(mockSession);
      mockUnitOfWork.transactions.save.mockResolvedValue(undefined);
      mockUnitOfWork.sessions.save.mockResolvedValue(undefined);

      const result = await addTransactionUseCase.execute(request);

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.sessions.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: request.sessionId })
      );
      expect(mockUnitOfWork.sessions.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.sessionId).toBe(mockSession.id.value);
      expect(result.type).toBe(request.type);
    });

    it("should throw error if session not found", async () => {
      const request = {
        sessionId: "session-123",
        type: TransactionType.BUY_IN,
        amount: { amount: 50, currency: "USD" },
      };

      mockUnitOfWork.sessions.findById.mockResolvedValue(null);

      await expect(addTransactionUseCase.execute(request)).rejects.toThrow(
        "Session not found"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("GetSessionUseCase", () => {
    it("should get session successfully", async () => {
      const sessionId = "session-123";
      const mockPlayer = Player.create("John Doe");
      const mockSession = Session.start(
        mockPlayer.id,
        "Casino Royale",
        new Stakes(
          new Money(1, config.poker.defaultCurrency),
          new Money(2, config.poker.defaultCurrency)
        ),
        new Money(100, config.poker.defaultCurrency),
        "Test session"
      );

      mockUnitOfWork.sessions.findById.mockResolvedValue(mockSession);

      const result = await getSessionUseCase.execute(sessionId);

      expect(mockUnitOfWork.sessions.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: sessionId })
      );
      expect(result.sessionId).toBe(mockSession.id.value);
      expect(result.playerId).toBe(mockPlayer.id.value);
    });

    it("should throw error if session not found", async () => {
      const sessionId = "session-123";

      mockUnitOfWork.sessions.findById.mockResolvedValue(null);

      await expect(getSessionUseCase.execute(sessionId)).rejects.toThrow(
        "Session not found"
      );
    });
  });

  describe("ListSessionsUseCase", () => {
    it("should list sessions successfully", async () => {
      const request = {
        playerId: "player-123",
        limit: 10,
        offset: 0,
      };

      const mockPlayer = Player.create("John Doe");
      const mockSessions = [
        Session.start(
          mockPlayer.id,
          "Casino Royale",
          new Stakes(
            new Money(1, config.poker.defaultCurrency),
            new Money(2, config.poker.defaultCurrency)
          ),
          new Money(100, config.poker.defaultCurrency),
          "Test session 1"
        ),
        Session.start(
          mockPlayer.id,
          "Casino Royale",
          new Stakes(
            new Money(1, config.poker.defaultCurrency),
            new Money(2, config.poker.defaultCurrency)
          ),
          new Money(100, config.poker.defaultCurrency),
          "Test session 2"
        ),
      ];

      mockUnitOfWork.sessions.findByFilters.mockResolvedValue({
        sessions: mockSessions,
        total: 2,
      });

      const result = await listSessionsUseCase.execute(request);

      expect(mockUnitOfWork.sessions.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: request.playerId,
          page: 1,
          limit: 10,
        })
      );
      expect(result.sessions).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
