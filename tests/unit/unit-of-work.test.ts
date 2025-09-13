import { PostgresUnitOfWork } from "@/infrastructure/database/unit-of-work";
import { DatabaseConnection } from "@/infrastructure/database/connection";

// Mock the database connection
jest.mock("@/infrastructure/database/connection");
jest.mock("@/shared/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("PostgresUnitOfWork", () => {
  let unitOfWork: PostgresUnitOfWork;
  let mockClient: any;
  let mockDb: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock client
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    // Mock database connection
    mockDb = {
      getClient: jest.fn().mockResolvedValue(mockClient),
    };

    (DatabaseConnection.getInstance as jest.Mock).mockReturnValue(mockDb);

    unitOfWork = new PostgresUnitOfWork();
  });

  describe("constructor", () => {
    it("should initialize repositories", () => {
      expect(unitOfWork.players).toBeDefined();
      expect(unitOfWork.sessions).toBeDefined();
      expect(unitOfWork.transactions).toBeDefined();
    });
  });

  describe("begin", () => {
    it("should start a transaction", async () => {
      await unitOfWork.begin();

      expect(mockDb.getClient).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
    });

    it("should throw error if begin fails", async () => {
      mockClient.query.mockRejectedValue(new Error("Connection failed"));

      await expect(unitOfWork.begin()).rejects.toThrow(
        "Failed to begin transaction"
      );
    });
  });

  describe("commit", () => {
    it("should commit transaction when active", async () => {
      await unitOfWork.begin();
      await unitOfWork.commit();

      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should throw error if no active transaction", async () => {
      await expect(unitOfWork.commit()).rejects.toThrow(
        "No active transaction to commit"
      );
    });

    it("should release client even if commit fails", async () => {
      await unitOfWork.begin();
      mockClient.query.mockRejectedValue(new Error("Commit failed"));

      await expect(unitOfWork.commit()).rejects.toThrow(
        "Failed to commit transaction"
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("rollback", () => {
    it("should rollback transaction when active", async () => {
      await unitOfWork.begin();
      await unitOfWork.rollback();

      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should throw error if no active transaction", async () => {
      await expect(unitOfWork.rollback()).rejects.toThrow(
        "No active transaction to rollback"
      );
    });

    it("should release client even if rollback fails", async () => {
      await unitOfWork.begin();
      mockClient.query.mockRejectedValue(new Error("Rollback failed"));

      await expect(unitOfWork.rollback()).rejects.toThrow(
        "Failed to rollback transaction"
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
