import dotenv from "dotenv";

dotenv.config();

// Helper function to get required environment variables
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

// Helper function to get required environment variables with validation
function getRequiredEnvWithValidation(
  key: string,
  validator: (value: string) => boolean,
  errorMessage: string
): string {
  const value = getRequiredEnv(key);
  if (!validator(value)) {
    throw new Error(`${errorMessage} (${key}=${value})`);
  }
  return value;
}

// Validation functions
const isNonEmptyString = (value: string): boolean => value.trim().length > 0;
const isJwtSecret = (value: string): boolean => value.length >= 32;
const isCurrencyCode = (value: string): boolean => /^[A-Z]{3}$/.test(value);

export const config = {
  // Server configuration
  port: parseInt(process.env["PORT"] || "3000", 10),
  nodeEnv: process.env["NODE_ENV"] || "development",
  apiBaseUrl: process.env["API_BASE_URL"] || "http://localhost:3000",

  // CORS configuration
  cors: {
    origin:
      process.env["CORS_ORIGIN"] ||
      (() => {
        if (process.env["NODE_ENV"] === "production") {
          throw new Error("CORS_ORIGIN must be set in production environment");
        }
        return "http://localhost:3000"; // Safe default for development
      })(),
    credentials: true,
  },

  // Database configuration - All sensitive values are required
  database: {
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432", 10),
    name: getRequiredEnvWithValidation(
      "DB_NAME",
      isNonEmptyString,
      "Database name must be a non-empty string"
    ),
    username: getRequiredEnvWithValidation(
      "DB_USERNAME",
      isNonEmptyString,
      "Database username must be a non-empty string"
    ),
    password: getRequiredEnvWithValidation(
      "DB_PASSWORD",
      (value) => value.length >= 8,
      "Database password must be at least 8 characters long"
    ),
    ssl: process.env["DB_SSL"] === "true",
  },

  // JWT configuration - Secret is required and must be secure
  jwt: {
    secret: getRequiredEnvWithValidation(
      "JWT_SECRET",
      isJwtSecret,
      "JWT secret must be at least 32 characters long"
    ),
    expiresIn: process.env["JWT_EXPIRES_IN"] || "24h",
  },

  // Logging configuration
  logging: {
    level: process.env["LOG_LEVEL"] || "info",
    file: process.env["LOG_FILE"] || "logs/app.log",
  },

  // Poker-specific configuration
  poker: {
    defaultCurrency: getRequiredEnvWithValidation(
      "DEFAULT_CURRENCY",
      isCurrencyCode,
      "Default currency must be a valid 3-letter currency code (e.g., USD, EUR)"
    ),
    supportedGames: ["Texas Hold'em", "Omaha", "Seven Card Stud"],
    supportedStakes: ["micro", "low", "medium", "high", "nosebleed"],
  },
} as const;

export type Config = typeof config;
