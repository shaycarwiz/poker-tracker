import { Player, Session, User, UserId } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";
import { TransactionType, SessionStatus } from "@/model/enums";
import {
  CreatePlayerUseCase,
  GetPlayerUseCase,
  UpdatePlayerUseCase,
  DeletePlayerUseCase,
  ListPlayersUseCase,
  AddBankrollUseCase,
} from "@/application/use-cases/players";
import {
  StartSessionUseCase,
  EndSessionUseCase,
  AddTransactionUseCase,
  GetSessionUseCase,
  ListSessionsUseCase,
} from "@/application/use-cases/session";
import { config } from "@/infrastructure";

const testUserId = new UserId("user-123");

function createTestPlayer(name = "John Doe", email?: string): Player {
  return Player.create(name, testUserId, email);
}

function startTestSession(notes?: string): { player: Player; session: Session } {
  const player = createTestPlayer();
  const stakes = new Stakes(
    new Money(1, config.poker.defaultCurrency),
    new Money(2, config.poker.defaultCurrency)
  );
  const session = Session.start(
    testUserId,
    "Casino Royale",
    stakes,
    new Money(100, config.poker.defaultCurrency),
    player.id,
    notes
  );
  return { player, session };
}

function createUserWithDefaultPlayer(player: Player): User {
  const user = User.createFromGoogle(
    "google-123",
    "Test User",
    "test@example.com"
  );
  user.setDefaultPlayer(player.id);
  return user;
}

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
    jest.clearAllMocks();

    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      users: {
        findById: jest.fn(),
        save: jest.fn(),
        findByGoogleId: jest.fn(),
        findByEmail: jest.fn(),
      },
      players: {
        findById: jest.fn(),
        findByOwnerUserId: jest.fn().mockResolvedValue([]),
        findByOwnerUserIdPaginated: jest.fn().mockResolvedValue({
          players: [],
          total: 0,
        }),
        save: jest.fn(),
        delete: jest.fn(),
        findByName: jest.fn(),
      },
      sessions: {
        findById: jest.fn(),
        save: jest.fn(),
        findByUserId: jest.fn().mockResolvedValue([]),
        findActiveByUserId: jest.fn(),
        findByFilters: jest.fn(),
      },
      transactions: {
        save: jest.fn(),
      },
    } as any;

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
        ownerUserId: testUserId.value,
        name: "John Doe",
        email: "john@example.com",
        initialBankroll: {
          amount: 1000,
          currency: "USD",
        },
      };

      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await createPlayerUseCase.execute(request);

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.players.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.name).toBe(request.name);
      expect(result.email).toBe(request.email);
      expect(result.bankroll.amount).toBe(request.initialBankroll.amount);
    });

    it("should create player without email", async () => {
      const request = {
        ownerUserId: testUserId.value,
        name: "Jane Doe",
      };

      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await createPlayerUseCase.execute(request);

      expect(mockUnitOfWork.players.save).toHaveBeenCalled();
      expect(result.name).toBe(request.name);
      expect(result.email).toBeUndefined();
      expect(result.bankroll.amount).toBe(0);
    });

    it("should rollback on error", async () => {
      const request = {
        ownerUserId: testUserId.value,
        name: "John Doe",
        email: "john@example.com",
      };

      mockUnitOfWork.players.save.mockRejectedValue(new Error("Database error"));

      await expect(createPlayerUseCase.execute(request)).rejects.toThrow(
        "Database error"
      );

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("GetPlayerUseCase", () => {
    it("should get player successfully", async () => {
      const playerId = "player-123";
      const mockPlayer = createTestPlayer("John Doe", "john@example.com");
      const mockSessions: Session[] = [];

      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.sessions.findByUserId.mockResolvedValue(mockSessions);

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

      const mockPlayer = createTestPlayer("John Doe", "john@example.com");
      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await updatePlayerUseCase.execute({
        id: playerId,
        ownerUserId: testUserId.value,
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
        updatePlayerUseCase.execute({
          id: playerId,
          ownerUserId: testUserId.value,
          ...request,
        })
      ).rejects.toThrow("Player not found");

      expect(mockUnitOfWork.rollback).toHaveBeenCalled();
    });
  });

  describe("DeletePlayerUseCase", () => {
    it("should delete player successfully", async () => {
      const playerId = "player-123";
      const mockPlayer = createTestPlayer();

      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.sessions.findByUserId.mockResolvedValue([]);
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
        createTestPlayer("John Doe", "john@example.com"),
        createTestPlayer("Jane Doe", "jane@example.com"),
      ];

      mockUnitOfWork.players.findByOwnerUserIdPaginated.mockResolvedValue({
        players: mockPlayers,
        total: 2,
      });
      mockUnitOfWork.sessions.findByUserId.mockResolvedValue([]);

      const result = await listPlayersUseCase.execute(testUserId.value, 1, 10);

      expect(
        mockUnitOfWork.players.findByOwnerUserIdPaginated
      ).toHaveBeenCalledWith(testUserId, 1, 10);
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

      const mockPlayer = createTestPlayer();
      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.players.save.mockResolvedValue(undefined);

      const result = await addBankrollUseCase.execute({
        playerId,
        ownerUserId: testUserId.value,
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
        addBankrollUseCase.execute({
          playerId,
          ownerUserId: testUserId.value,
          amount: request,
        })
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
    jest.clearAllMocks();

    mockUnitOfWork = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      users: {
        findById: jest.fn(),
        save: jest.fn(),
        findByGoogleId: jest.fn(),
        findByEmail: jest.fn(),
      },
      players: {
        findById: jest.fn(),
        findByOwnerUserId: jest.fn().mockResolvedValue([]),
        findByOwnerUserIdPaginated: jest.fn().mockResolvedValue({
          players: [],
          total: 0,
        }),
        save: jest.fn(),
        delete: jest.fn(),
        findByName: jest.fn(),
      },
      sessions: {
        findById: jest.fn(),
        save: jest.fn(),
        findByUserId: jest.fn().mockResolvedValue([]),
        findActiveByUserId: jest.fn(),
        findByFilters: jest.fn(),
      },
      transactions: {
        save: jest.fn(),
      },
    } as any;

    startSessionUseCase = new StartSessionUseCase(mockUnitOfWork);
    endSessionUseCase = new EndSessionUseCase(mockUnitOfWork);
    addTransactionUseCase = new AddTransactionUseCase(mockUnitOfWork);
    getSessionUseCase = new GetSessionUseCase(mockUnitOfWork);
    listSessionsUseCase = new ListSessionsUseCase(mockUnitOfWork);
  });

  describe("StartSessionUseCase", () => {
    it("should start session successfully", async () => {
      const mockPlayer = createTestPlayer();
      const mockUser = createUserWithDefaultPlayer(mockPlayer);
      const request = {
        userId: testUserId.value,
        location: "Casino Royale",
        stakes: {
          smallBlind: 1,
          bigBlind: 2,
          currency: "USD",
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        notes: "Test session",
      };

      mockUnitOfWork.users.findById.mockResolvedValue(mockUser);
      mockUnitOfWork.players.findById.mockResolvedValue(mockPlayer);
      mockUnitOfWork.sessions.findActiveByUserId.mockResolvedValue(null);
      mockUnitOfWork.sessions.save.mockResolvedValue(undefined);

      const result = await startSessionUseCase.execute(request);

      expect(mockUnitOfWork.begin).toHaveBeenCalled();
      expect(mockUnitOfWork.sessions.findActiveByUserId).toHaveBeenCalledWith(
        testUserId
      );
      expect(mockUnitOfWork.sessions.save).toHaveBeenCalled();
      expect(mockUnitOfWork.commit).toHaveBeenCalled();
      expect(result.userId).toBe(testUserId.value);
      expect(result.location).toBe(request.location);
    });
  });

  describe("EndSessionUseCase", () => {
    it("should end session successfully", async () => {
      const { player, session: mockSession } = startTestSession("Test session");
      const request = {
        sessionId: mockSession.id.value,
        userId: testUserId.value,
        playerId: player.id.value,
        finalCashOut: { amount: 150, currency: config.poker.defaultCurrency },
        notes: "Ended session",
      };

      mockUnitOfWork.sessions.findById.mockResolvedValue(mockSession);
      mockUnitOfWork.players.findById.mockResolvedValue(player);
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
        userId: testUserId.value,
        playerId: "player-123",
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
      const { player, session: mockSession } = startTestSession("Test session");
      const request = {
        sessionId: mockSession.id.value,
        userId: testUserId.value,
        playerId: player.id.value,
        type: TransactionType.BUY_IN,
        amount: { amount: 50, currency: "USD" },
        description: "Additional buy-in",
      };

      mockUnitOfWork.sessions.findById.mockResolvedValue(mockSession);
      mockUnitOfWork.players.findById.mockResolvedValue(player);
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
        userId: testUserId.value,
        playerId: "player-123",
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
      const { session: mockSession } = startTestSession("Test session");
      const sessionId = mockSession.id.value;

      mockUnitOfWork.sessions.findById.mockResolvedValue(mockSession);

      const result = await getSessionUseCase.execute(sessionId);

      expect(mockUnitOfWork.sessions.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: sessionId })
      );
      expect(result.sessionId).toBe(mockSession.id.value);
      expect(result.userId).toBe(testUserId.value);
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
        userId: testUserId.value,
        limit: 10,
        page: 1,
      };

      const { session: session1 } = startTestSession("Test session 1");
      const { session: session2 } = startTestSession("Test session 2");
      const mockSessions = [session1, session2];

      mockUnitOfWork.sessions.findByFilters.mockResolvedValue({
        sessions: mockSessions,
        total: 2,
      });

      const result = await listSessionsUseCase.execute(request);

      expect(mockUnitOfWork.sessions.findByFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: request.userId,
          page: 1,
          limit: 10,
        })
      );
      expect(result.sessions).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
