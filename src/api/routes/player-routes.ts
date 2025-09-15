import { Router } from "express";
import { PlayerController } from "../controllers/player-controller";
import {
  validateCreatePlayer,
  validateUpdateBankroll,
  validatePlayerId,
  validateSearchQuery,
} from "../validators/player-validators";

const router = Router();
const playerController = new PlayerController();

// Player routes
router.post(
  "/",
  validateCreatePlayer,
  playerController.createPlayer.bind(playerController)
);
router.get("/", playerController.getAllPlayers.bind(playerController));
router.get(
  "/search",
  validateSearchQuery,
  playerController.searchPlayers.bind(playerController)
);
router.get(
  "/:id",
  validatePlayerId,
  playerController.getPlayer.bind(playerController)
);
router.get(
  "/:id/stats",
  validatePlayerId,
  playerController.getPlayerStats.bind(playerController)
);
router.patch(
  "/:id/bankroll",
  validatePlayerId,
  validateUpdateBankroll,
  playerController.updatePlayerBankroll.bind(playerController)
);
router.delete(
  "/:id",
  validatePlayerId,
  playerController.deletePlayer.bind(playerController)
);

export { router as playerRoutes };
