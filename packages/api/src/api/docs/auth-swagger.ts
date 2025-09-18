/**
 * Swagger documentation for Authentication endpoints
 * This file contains all Swagger/OpenAPI documentation for the auth controller
 * to keep the controller code clean and focused on business logic.
 */

export const authSwaggerDocs = {
  components: {
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["googleId", "email", "name"],
        properties: {
          googleId: {
            type: "string",
            description: "Google OAuth ID",
            example: "1234567890",
          },
          email: {
            type: "string",
            format: "email",
            description: "User's email address",
            example: "john@example.com",
          },
          name: {
            type: "string",
            description: "User's display name",
            example: "John Doe",
          },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "JWT authentication token",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                description: "Player ID",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              name: {
                type: "string",
                description: "Player name",
                example: "John Doe",
              },
              email: {
                type: "string",
                format: "email",
                description: "Player email",
                example: "john@example.com",
              },
              currentBankroll: {
                type: "number",
                description: "Current bankroll amount",
                example: 1000,
              },
              totalSessions: {
                type: "number",
                description: "Total number of sessions",
                example: 5,
              },
            },
          },
        },
      },
      ProfileResponse: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Player ID",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
          name: {
            type: "string",
            description: "Player name",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Player email",
            example: "john@example.com",
          },
          currentBankroll: {
            type: "number",
            description: "Current bankroll amount",
            example: 1000,
          },
          totalSessions: {
            type: "number",
            description: "Total number of sessions",
            example: 5,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Account creation date",
            example: "2024-01-01T00:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update date",
            example: "2024-01-01T00:00:00.000Z",
          },
        },
      },
      UpdateProfileRequest: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Updated player name",
            example: "John Smith",
          },
          email: {
            type: "string",
            format: "email",
            description: "Updated email address",
            example: "johnsmith@example.com",
          },
        },
      },
      AuthError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Error message",
            example: "Authentication required",
          },
          code: {
            type: "string",
            description: "Error code",
            example: "UNAUTHORIZED",
          },
        },
      },
    },
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from login endpoint",
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login with Google OAuth",
        description:
          "Authenticate user with Google OAuth credentials and return JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
              },
            },
          },
          "400": {
            description: "Bad request - missing required fields",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Missing required fields: googleId, email, name",
                  code: "MISSING_FIELDS",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Internal server error",
                  code: "LOGIN_ERROR",
                },
              },
            },
          },
        },
      },
    },
    "/auth/profile": {
      get: {
        tags: ["Authentication"],
        summary: "Get user profile",
        description: "Retrieve the authenticated user's profile information",
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProfileResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Authentication required",
                  code: "UNAUTHORIZED",
                },
              },
            },
          },
          "404": {
            description: "Player not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Player not found",
                  code: "PLAYER_NOT_FOUND",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Internal server error",
                  code: "PROFILE_ERROR",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Authentication"],
        summary: "Update user profile",
        description: "Update the authenticated user's profile information",
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateProfileRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProfileResponse",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized - authentication required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Authentication required",
                  code: "UNAUTHORIZED",
                },
              },
            },
          },
          "404": {
            description: "Player not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Player not found",
                  code: "PLAYER_NOT_FOUND",
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthError",
                },
                example: {
                  error: "Internal server error",
                  code: "UPDATE_PROFILE_ERROR",
                },
              },
            },
          },
        },
      },
    },
  },
};
