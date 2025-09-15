import { Request, Response, NextFunction } from "express";
import {
  validateCreatePlayer,
  validateUpdateBankroll,
  validatePlayerId,
  validateSearchQuery,
} from "@/api/validators/player-validators";
import {
  validateStartSession,
  validateEndSession,
  validateAddTransaction,
  validateSessionId,
  validatePlayerId as validateSessionPlayerId,
  validateUpdateNotes,
  validateCancelSession,
} from "@/api/validators/session-validators";
import { TransactionType } from "@/model/enums";

describe("Player Validators", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("validateCreatePlayer", () => {
    it("should pass validation for valid player data", () => {
      mockRequest.body = {
        name: "John Doe",
        email: "john@example.com",
        initialBankroll: {
          amount: 1000,
          currency: "USD",
        },
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should pass validation for minimal player data", () => {
      mockRequest.body = {
        name: "Jane Doe",
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing name", () => {
      mockRequest.body = {
        email: "john@example.com",
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Name is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for empty name", () => {
      mockRequest.body = {
        name: "",
        email: "john@example.com",
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Name is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string name", () => {
      mockRequest.body = {
        name: 123,
        email: "john@example.com",
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Name is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for invalid email", () => {
      mockRequest.body = {
        name: "John Doe",
        email: "invalid-email",
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Email must be a valid email address",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string email", () => {
      mockRequest.body = {
        name: "John Doe",
        email: 123,
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Email must be a valid email address",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for negative initial bankroll amount", () => {
      mockRequest.body = {
        name: "John Doe",
        initialBankroll: {
          amount: -100,
          currency: "USD",
        },
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Initial bankroll amount must be a non-negative number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-number initial bankroll amount", () => {
      mockRequest.body = {
        name: "John Doe",
        initialBankroll: {
          amount: "invalid",
          currency: "USD",
        },
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Initial bankroll amount must be a non-negative number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string initial bankroll currency", () => {
      mockRequest.body = {
        name: "John Doe",
        initialBankroll: {
          amount: 1000,
          currency: 123,
        },
      };

      validateCreatePlayer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Initial bankroll currency must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateUpdateBankroll", () => {
    it("should pass validation for valid bankroll data", () => {
      mockRequest.body = {
        amount: 500,
        currency: "USD",
      };

      validateUpdateBankroll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should pass validation without currency", () => {
      mockRequest.body = {
        amount: 500,
      };

      validateUpdateBankroll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing amount", () => {
      mockRequest.body = {
        currency: "USD",
      };

      validateUpdateBankroll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Amount is required and must be a number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-number amount", () => {
      mockRequest.body = {
        amount: "invalid",
        currency: "USD",
      };

      validateUpdateBankroll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Amount is required and must be a number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string currency", () => {
      mockRequest.body = {
        amount: 500,
        currency: 123,
      };

      validateUpdateBankroll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Currency must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validatePlayerId", () => {
    it("should pass validation for valid player ID", () => {
      mockRequest.params = { id: "player-123" };

      validatePlayerId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing player ID", () => {
      mockRequest.params = {};

      validatePlayerId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Player ID is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for empty player ID", () => {
      mockRequest.params = { id: "" };

      validatePlayerId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Player ID is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string player ID", () => {
      mockRequest.params = { id: 123 as any };

      validatePlayerId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Player ID is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateSearchQuery", () => {
    it("should pass validation for valid search query", () => {
      mockRequest.query = { name: "John" };

      validateSearchQuery(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing name", () => {
      mockRequest.query = {};

      validateSearchQuery(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error:
          "Name query parameter is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for empty name", () => {
      mockRequest.query = { name: "" };

      validateSearchQuery(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error:
          "Name query parameter is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string name", () => {
      mockRequest.query = { name: 123 as any };

      validateSearchQuery(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error:
          "Name query parameter is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

describe("Session Validators", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("validateStartSession", () => {
    it("should pass validation for valid session data", () => {
      mockRequest.body = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        notes: "Test session",
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing playerId", () => {
      mockRequest.body = {
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Player ID is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for missing location", () => {
      mockRequest.body = {
        playerId: "player-123",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Location is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for missing stakes", () => {
      mockRequest.body = {
        playerId: "player-123",
        location: "Casino Royale",
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Stakes with smallBlind and bigBlind are required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for invalid small blind amount", () => {
      mockRequest.body = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 0, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Small blind amount must be a positive number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for invalid big blind amount", () => {
      mockRequest.body = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 0, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Big blind amount must be a positive number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation when big blind is not greater than small blind", () => {
      mockRequest.body = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 2, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Big blind must be greater than small blind",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for missing initial buy-in", () => {
      mockRequest.body = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error:
          "Initial buy-in amount is required and must be a positive number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string notes", () => {
      mockRequest.body = {
        playerId: "player-123",
        location: "Casino Royale",
        stakes: {
          smallBlind: { amount: 1, currency: "USD" },
          bigBlind: { amount: 2, currency: "USD" },
        },
        initialBuyIn: { amount: 100, currency: "USD" },
        notes: 123,
      };

      validateStartSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Notes must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateEndSession", () => {
    it("should pass validation for valid end session data", () => {
      mockRequest.body = {
        finalCashOut: { amount: 150, currency: "USD" },
        notes: "Ended session",
      };

      validateEndSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should pass validation without notes", () => {
      mockRequest.body = {
        finalCashOut: { amount: 150, currency: "USD" },
      };

      validateEndSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing final cash out", () => {
      mockRequest.body = {
        notes: "Ended session",
      };

      validateEndSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error:
          "Final cash out amount is required and must be a non-negative number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for negative final cash out", () => {
      mockRequest.body = {
        finalCashOut: { amount: -50, currency: "USD" },
      };

      validateEndSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error:
          "Final cash out amount is required and must be a non-negative number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string notes", () => {
      mockRequest.body = {
        finalCashOut: { amount: 150, currency: "USD" },
        notes: 123,
      };

      validateEndSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Notes must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateAddTransaction", () => {
    it("should pass validation for valid transaction data", () => {
      mockRequest.body = {
        type: TransactionType.BUY_IN,
        amount: { amount: 50, currency: "USD" },
        description: "Additional buy-in",
        notes: "Test transaction",
      };

      validateAddTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should pass validation without optional fields", () => {
      mockRequest.body = {
        type: TransactionType.BUY_IN,
        amount: { amount: 50, currency: "USD" },
      };

      validateAddTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for invalid transaction type", () => {
      mockRequest.body = {
        type: "INVALID_TYPE",
        amount: { amount: 50, currency: "USD" },
      };

      validateAddTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Valid transaction type is required",
        validTypes: Object.values(TransactionType),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for missing amount", () => {
      mockRequest.body = {
        type: TransactionType.BUY_IN,
      };

      validateAddTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Amount is required and must be a positive number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-positive amount", () => {
      mockRequest.body = {
        type: TransactionType.BUY_IN,
        amount: { amount: 0, currency: "USD" },
      };

      validateAddTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Amount is required and must be a positive number",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string description", () => {
      mockRequest.body = {
        type: TransactionType.BUY_IN,
        amount: { amount: 50, currency: "USD" },
        description: 123,
      };

      validateAddTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Description must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string notes", () => {
      mockRequest.body = {
        type: TransactionType.BUY_IN,
        amount: { amount: 50, currency: "USD" },
        notes: 123,
      };

      validateAddTransaction(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Notes must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateSessionId", () => {
    it("should pass validation for valid session ID", () => {
      mockRequest.params = { id: "session-123" };

      validateSessionId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing session ID", () => {
      mockRequest.params = {};

      validateSessionId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Session ID is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validatePlayerId (session)", () => {
    it("should pass validation for valid player ID", () => {
      mockRequest.params = { playerId: "player-123" };

      validateSessionPlayerId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for missing player ID", () => {
      mockRequest.params = {};

      validateSessionPlayerId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Player ID is required and must be a non-empty string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateUpdateNotes", () => {
    it("should pass validation for valid notes", () => {
      mockRequest.body = { notes: "Updated notes" };

      validateUpdateNotes(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string notes", () => {
      mockRequest.body = { notes: 123 };

      validateUpdateNotes(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Notes must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateCancelSession", () => {
    it("should pass validation for valid cancel data", () => {
      mockRequest.body = { reason: "Emergency" };

      validateCancelSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should pass validation without reason", () => {
      mockRequest.body = {};

      validateCancelSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should fail validation for non-string reason", () => {
      mockRequest.body = { reason: 123 };

      validateCancelSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Reason must be a string",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
