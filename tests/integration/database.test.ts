import { DatabaseConnection } from "@/infrastructure/database/connection";
import { PostgresUnitOfWork } from "@/infrastructure/database/unit-of-work";

describe("Database Integration", () => {
  let db: DatabaseConnection;
  let unitOfWork: PostgresUnitOfWork;

  beforeAll(async () => {
    db = DatabaseConnection.getInstance();
    unitOfWork = new PostgresUnitOfWork();
  });

  afterAll(async () => {
    await db.close();
  });

  describe("Connection", () => {
    it("should connect to database", async () => {
      const client = await db.getClient();
      expect(client).toBeDefined();
      client.release();
    });

    it("should execute query", async () => {
      const result = await db.query("SELECT 1 as test");
      expect(result.rows[0].test).toBe(1);
    });
  });

  describe("Unit of Work", () => {
    it("should begin and commit transaction", async () => {
      await unitOfWork.begin();
      await unitOfWork.commit();
    });

    it("should begin and rollback transaction", async () => {
      await unitOfWork.begin();
      await unitOfWork.rollback();
    });
  });
});
