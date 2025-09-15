import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { errorHandler } from "./api/middleware/errorHandler";
import { notFoundHandler } from "./api/middleware/notFoundHandler";
import { logger } from "./shared/utils/logger";
import { config } from "./infrastructure/config";
import { container } from "./infrastructure/container";
import { setupSwagger } from "./infrastructure/config/swagger";

// Load environment variables
dotenv.config();

// Initialize event handlers
container.initializeEventHandlers();

const app = express();
const PORT = config.port || 3000;

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Health check endpoint
app.get("/health", (_, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API routes
import { apiRoutes } from "./api/routes";
app.use(apiRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Only start server if not in test environment
let server: ReturnType<typeof app.listen> | null = null;

if (process.env["NODE_ENV"] !== "test") {
  server = app.listen(PORT, () => {
    logger.info(`🚀 Poker Tracker server running on port ${PORT}`);
    logger.info(`📊 Environment: ${config.nodeEnv}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server?.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    server?.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });
}

export default app;
