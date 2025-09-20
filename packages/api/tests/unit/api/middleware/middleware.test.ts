import { Request, Response, NextFunction } from "express";
import {
  errorHandler,
  CustomError,
  AppError,
} from "@/api/middleware/errorHandler";
import { notFoundHandler } from "@/api/middleware/notFoundHandler";

// Mock logger
jest.mock("@/shared/utils/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("Error Handler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      url: "/api/v1/players",
      method: "GET",
      ip: "127.0.0.1",
      get: jest.fn().mockReturnValue("Mozilla/5.0"),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("CustomError", () => {
    it("should create CustomError with default values", () => {
      const error = new CustomError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe("Error"); // CustomError extends Error, so name is "Error"
      expect(error.stack).toBeDefined();
    });

    it("should create CustomError with custom values", () => {
      const error = new CustomError("Not found", 404, false);

      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(false);
    });

    it("should capture stack trace", () => {
      const error = new CustomError("Test error");
      expect(error.stack).toContain("Error");
    });
  });

  describe("errorHandler", () => {
    it("should handle CustomError with custom status code", () => {
      const error = new CustomError("Player not found", 404);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Player not found",
        },
        timestamp: expect.any(String),
      });
    });

    it("should handle CustomError with 500 status code", () => {
      const error = new CustomError("Internal server error", 500);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Internal Server Error",
        },
        timestamp: expect.any(String),
      });
    });

    it("should handle regular Error with default status code", () => {
      const error = new Error("Regular error");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Internal Server Error",
        },
        timestamp: expect.any(String),
      });
    });

    it("should handle AppError with custom status code", () => {
      const error: AppError = new Error("Validation error");
      error.statusCode = 400;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Validation error",
        },
        timestamp: expect.any(String),
      });
    });

    it("should include stack trace in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error = new CustomError("Test error", 400);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Test error",
          stack: error.stack,
        },
        timestamp: expect.any(String),
      });

      process.env.NODE_ENV = originalEnv || "test";
    });

    it("should not include stack trace in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error = new CustomError("Test error", 400);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Test error",
        },
        timestamp: expect.any(String),
      });

      process.env.NODE_ENV = originalEnv || "test";
    });

    it("should log error details", () => {
      const { logger } = require("@/shared/utils/logger");
      const error = new CustomError("Test error", 400);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(logger.error).toHaveBeenCalledWith("Error occurred:", {
        error: {
          message: "Test error",
          statusCode: 400,
          stack: error.stack,
          url: "/api/v1/players",
          method: "GET",
          ip: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        },
      });
    });

    it("should handle error without stack trace", () => {
      const error = new Error("Test error");
      delete error.stack;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Internal Server Error",
        },
        timestamp: expect.any(String),
      });
    });

    it("should handle error without user agent", () => {
      const error = new CustomError("Test error", 400);
      mockRequest.get = jest.fn().mockReturnValue(undefined);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Test error",
        },
        timestamp: expect.any(String),
      });
    });
  });
});

describe("Not Found Handler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: "/api/v1/nonexistent",
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("notFoundHandler", () => {
    it("should return 404 for any route", () => {
      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Route /api/v1/nonexistent not found",
          statusCode: 404,
        },
        timestamp: expect.any(String),
      });
    });

    it("should handle different URLs", () => {
      mockRequest.originalUrl = "/api/v1/players/invalid-id";

      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Route /api/v1/players/invalid-id not found",
          statusCode: 404,
        },
        timestamp: expect.any(String),
      });
    });

    it("should handle root path", () => {
      mockRequest.originalUrl = "/";

      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Route / not found",
          statusCode: 404,
        },
        timestamp: expect.any(String),
      });
    });

    it("should include timestamp in response", () => {
      const beforeCall = new Date();

      notFoundHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const afterCall = new Date();

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Route /api/v1/nonexistent not found",
          statusCode: 404,
        },
        timestamp: expect.any(String),
      });

      // Verify timestamp is within expected range
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = new Date(responseCall.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });
});
