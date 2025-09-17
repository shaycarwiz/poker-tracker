import { Router } from "express";
import { playerRoutes } from "./player-routes";
import { sessionRoutes } from "./session-routes";

const router = Router();

// API version prefix
const API_VERSION = "/api/v1";

// Mount route modules
router.use(`${API_VERSION}/players`, playerRoutes);
router.use(`${API_VERSION}/sessions`, sessionRoutes);

export { router as apiRoutes };
