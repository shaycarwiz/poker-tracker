import { Router } from "express";
import { PlayerController } from "../controllers/player-controller";
import { authenticateToken } from "../middleware/auth";
import {
  authorizePlayerAccess,
  requirePlayerProfile,
} from "../middleware/authorization";
import {
  validateCreatePlayer,
  validatePlayerId,
  validateSearchQuery,
  validateUpdateBankroll,
} from "../validators/player-validators";

const router = Router();
const playerController = new PlayerController();

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: Player management endpoints
 */

// Public routes (no authentication required)
router.post(
  "/",
  validateCreatePlayer,
  playerController.createPlayer.bind(playerController)
);

// Protected routes (authentication required)
router.get(
  "/me",
  authenticateToken,
  requirePlayerProfile,
  playerController.getCurrentPlayer.bind(playerController)
);

router.get(
  "/me/stats",
  authenticateToken,
  requirePlayerProfile,
  playerController.getCurrentPlayerStats.bind(playerController)
);

router.patch(
  "/me/bankroll",
  authenticateToken,
  requirePlayerProfile,
  validateUpdateBankroll,
  playerController.updateCurrentPlayerBankroll.bind(playerController)
);

// Admin routes (authentication + specific player access)
router.get(
  "/",
  authenticateToken,
  playerController.getAllPlayers.bind(playerController)
);

router.get(
  "/search",
  authenticateToken,
  validateSearchQuery,
  playerController.searchPlayers.bind(playerController)
);

router.get(
  "/:id",
  authenticateToken,
  validatePlayerId,
  authorizePlayerAccess,
  playerController.getPlayer.bind(playerController)
);

router.get(
  "/:id/stats",
  authenticateToken,
  validatePlayerId,
  authorizePlayerAccess,
  playerController.getPlayerStats.bind(playerController)
);

router.patch(
  "/:id/bankroll",
  authenticateToken,
  validatePlayerId,
  authorizePlayerAccess,
  validateUpdateBankroll,
  playerController.updatePlayerBankroll.bind(playerController)
);

router.delete(
  "/:id",
  authenticateToken,
  validatePlayerId,
  authorizePlayerAccess,
  playerController.deletePlayer.bind(playerController)
);

export { router as playerRoutes };
