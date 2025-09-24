import { APIErrorCode } from "../error-codes";

/**
 * Custom error class for domain errors with error codes
 */
export class DomainError extends Error {
  public readonly code: APIErrorCode;
  public readonly statusCode: number;

  constructor(code: APIErrorCode, message?: string, statusCode: number = 400) {
    super(message || code);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends DomainError {
  constructor(code: APIErrorCode, message?: string) {
    super(code, message, 400);
    this.name = "ValidationError";
  }
}

/**
 * Business logic error for domain rule violations
 */
export class BusinessError extends DomainError {
  constructor(code: APIErrorCode, message?: string) {
    super(code, message, 400);
    this.name = "BusinessError";
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends DomainError {
  constructor(code: APIErrorCode, message?: string) {
    super(code, message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Authentication error for auth failures
 */
export class AuthenticationError extends DomainError {
  constructor(code: APIErrorCode, message?: string) {
    super(code, message, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error for permission failures
 */
export class AuthorizationError extends DomainError {
  constructor(code: APIErrorCode, message?: string) {
    super(code, message, 403);
    this.name = "AuthorizationError";
  }
}
