import {
  APIErrorCode,
  APIErrorResponse,
  APISuccessResponse,
  APIResponse,
} from "./error-codes";

/**
 * Helper function to create standardized error responses
 */
export function createErrorResponse(
  code: APIErrorCode,
  statusCode: number,
  details?: Record<string, any>
): APIErrorResponse {
  return {
    success: false,
    error: code,
    code,
    statusCode,
    details,
  };
}

/**
 * Helper function to create standardized success responses
 */
export function createSuccessResponse<T>(data: T): APISuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper function to create validation error responses
 */
export function createValidationError(
  code: APIErrorCode,
  details?: Record<string, any>
): APIErrorResponse {
  return createErrorResponse(code, 400, details);
}

/**
 * Helper function to create business logic error responses
 */
export function createBusinessError(
  code: APIErrorCode,
  details?: Record<string, any>
): APIErrorResponse {
  return createErrorResponse(code, 400, details);
}

/**
 * Helper function to create not found error responses
 */
export function createNotFoundError(
  code: APIErrorCode,
  details?: Record<string, any>
): APIErrorResponse {
  return createErrorResponse(code, 404, details);
}

/**
 * Helper function to create authentication error responses
 */
export function createAuthError(
  code: APIErrorCode,
  details?: Record<string, any>
): APIErrorResponse {
  return createErrorResponse(code, 401, details);
}

/**
 * Helper function to create authorization error responses
 */
export function createAuthorizationError(
  code: APIErrorCode,
  details?: Record<string, any>
): APIErrorResponse {
  return createErrorResponse(code, 403, details);
}

/**
 * Helper function to create internal server error responses
 */
export function createInternalError(
  code: APIErrorCode,
  details?: Record<string, any>
): APIErrorResponse {
  return createErrorResponse(code, 500, details);
}

/**
 * Helper function to create rate limit error responses
 */
export function createRateLimitError(
  code: APIErrorCode,
  details?: Record<string, any>
): APIErrorResponse {
  return createErrorResponse(code, 429, details);
}

/**
 * Helper function to handle unknown errors and convert them to appropriate error codes
 */
export function handleUnknownError(
  error: unknown,
  fallbackCode: APIErrorCode
): APIErrorResponse {
  if (error instanceof Error) {
    // Check for specific error messages and map to appropriate codes
    const message = error.message.toLowerCase();

    if (message.includes("not found")) {
      if (message.includes("player")) {
        return createNotFoundError("BUSINESS_PLAYER_NOT_FOUND");
      }
      if (message.includes("session")) {
        return createNotFoundError("BUSINESS_SESSION_NOT_FOUND");
      }
      if (message.includes("transaction")) {
        return createNotFoundError("BUSINESS_TRANSACTION_NOT_FOUND");
      }
    }

    if (message.includes("invalid") || message.includes("required")) {
      return createValidationError("VALIDATION_NAME_REQUIRED");
    }

    if (message.includes("database") || message.includes("connection")) {
      return createInternalError("DATABASE_PLAYER_SAVE_FAILED");
    }
  }

  return createInternalError(fallbackCode);
}

/**
 * Helper function to check if a response is an error response
 */
export function isErrorResponse(
  response: APIResponse
): response is APIErrorResponse {
  return !response.success;
}

/**
 * Helper function to check if a response is a success response
 */
export function isSuccessResponse<T>(
  response: APIResponse<T>
): response is APISuccessResponse<T> {
  return response.success;
}
