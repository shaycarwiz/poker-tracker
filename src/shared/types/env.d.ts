/**
 * Environment variable type definitions for the Poker Tracker application
 *
 * This file provides TypeScript type definitions for all environment variables
 * used throughout the application, ensuring type safety and better IDE support.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server Configuration
      /** The port number the server should listen on (default: 3000) */
      PORT?: string;
      /** The current environment mode (development, production, test) */
      NODE_ENV?: "development" | "production" | "test";

      // CORS Configuration
      /** Allowed CORS origins (comma-separated list or single origin) */
      CORS_ORIGIN?: string;

      // Database Configuration
      /** Database host address */
      DB_HOST?: string;
      /** Database port number */
      DB_PORT?: string;
      /** Database name */
      DB_NAME?: string;
      /** Database username */
      DB_USERNAME?: string;
      /** Database password */
      DB_PASSWORD?: string;
      /** Whether to use SSL for database connection (true/false) */
      DB_SSL?: string;

      // JWT Configuration
      /** Secret key for JWT token signing */
      JWT_SECRET?: string;
      /** JWT token expiration time (e.g., "24h", "7d", "1h") */
      JWT_EXPIRES_IN?: string;

      // Logging Configuration
      /** Log level (error, warn, info, debug) */
      LOG_LEVEL?: "error" | "warn" | "info" | "debug";
      /** Path to log file */
      LOG_FILE?: string;

      // Poker Configuration
      /** Default currency for poker games */
      DEFAULT_CURRENCY?: string;

      // Optional: Additional environment variables that might be added in the future
      /** Redis URL for caching (optional) */
      REDIS_URL?: string;
      /** Email service configuration (optional) */
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      /** File upload configuration (optional) */
      UPLOAD_MAX_SIZE?: string;
      UPLOAD_ALLOWED_TYPES?: string;
    }
  }
}

// Export empty object to make this a module
export {};
