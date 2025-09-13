import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "poker_tracker",
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    ssl: process.env.DB_SSL === "true",
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },

  // Poker-specific configuration
  poker: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || "USD",
    supportedGames: ["Texas Hold'em", "Omaha", "Seven Card Stud"],
    supportedStakes: ["micro", "low", "medium", "high", "nosebleed"],
  },
} as const;

export type Config = typeof config;
