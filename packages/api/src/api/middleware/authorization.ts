import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";
import { container } from "../../infrastructure/container";
import { logger } from "../../shared/utils/logger";

/**
 * Middleware to check if the authenticated user can access a specific player's data
 * This ensures users can only access their own player data
 */
export const authorizePlayerAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    const { id: playerId } = req.params;

    if (!playerId) {
      res.status(400).json({
        error: "Player ID is required",
        code: "MISSING_PLAYER_ID",
      });
      return;
    }

    // Find the player by ID to get their associated user info
    const player = await container.services.players.getPlayer(playerId);

    if (!player) {
      res.status(404).json({
        error: "Player not found",
        code: "PLAYER_NOT_FOUND",
      });
      return;
    }

    // Check if the player belongs to the authenticated user
    // We'll need to add a user association to the player model
    // For now, we'll check by email as a temporary solution
    if (player.email !== req.user.email) {
      res.status(403).json({
        error: "Access denied. You can only access your own player data.",
        code: "FORBIDDEN",
      });
      return;
    }

    // Add the player to the request for use in controllers
    req.player = player;
    next();
  } catch (error) {
    logger.error("Authorization error", { error, userId: req.user?.googleId });
    res.status(500).json({
      error: "Authorization check failed",
      code: "AUTHORIZATION_ERROR",
    });
  }
};

/**
 * Middleware to ensure the user has a player profile
 * This should be used for endpoints that require a player to exist
 */
export const requirePlayerProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    // Find player by user email
    const player = await container.services.players.getPlayerByEmail(
      req.user.email
    );

    if (!player) {
      res.status(404).json({
        error:
          "Player profile not found. Please create a player profile first.",
        code: "PLAYER_PROFILE_NOT_FOUND",
      });
      return;
    }

    // Add the player to the request
    req.player = player;
    next();
  } catch (error) {
    logger.error("Player profile check error", {
      error,
      userId: req.user?.googleId,
    });
    res.status(500).json({
      error: "Player profile check failed",
      code: "PLAYER_PROFILE_ERROR",
    });
  }
};

// Extend the AuthenticatedRequest interface to include player
declare global {
  namespace Express {
    interface Request {
      player?: any; // We'll type this properly later
    }
  }
}
