import { Router } from "express";
import { SessionController } from "../controllers/session-controller";
import {
  validateAddTransaction,
  validateCancelSession,
  validateEndSession,
  validatePlayerId,
  validateSessionId,
  validateStartSession,
  validateUpdateNotes,
} from "../validators/session-validators";

const router = Router();
const sessionController = new SessionController();

// Session routes
router.post(
  "/",
  validateStartSession,
  sessionController.startSession.bind(sessionController),
);
router.get(
  "/:id",
  validateSessionId,
  sessionController.getSession.bind(sessionController),
);
router.post(
  "/:id/end",
  validateSessionId,
  validateEndSession,
  sessionController.endSession.bind(sessionController),
);
router.post(
  "/:id/transactions",
  validateSessionId,
  validateAddTransaction,
  sessionController.addTransaction.bind(sessionController),
);
router.post(
  "/:id/cancel",
  validateSessionId,
  validateCancelSession,
  sessionController.cancelSession.bind(sessionController),
);
router.patch(
  "/:id/notes",
  validateSessionId,
  validateUpdateNotes,
  sessionController.updateSessionNotes.bind(sessionController),
);

// Player-specific session routes
router.get(
  "/player/:playerId",
  validatePlayerId,
  sessionController.getPlayerSessions.bind(sessionController),
);
router.get(
  "/player/:playerId/active",
  validatePlayerId,
  sessionController.getActiveSession.bind(sessionController),
);

export { router as sessionRoutes };
