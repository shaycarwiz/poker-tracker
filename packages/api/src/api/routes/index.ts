import { Router } from "express";
import { playerRoutes } from "./player-routes";
import { sessionRoutes } from "./session-routes";
//import { authRoutes } from "./auth-routes";
import { RegisterRoutes } from "../tsoa/routes/routes";

const router = Router();
const tsoaRouter = Router();
RegisterRoutes(tsoaRouter);

// API version prefix
const API_VERSION = "/api/v1";

// Mount route modules
//router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/players`, playerRoutes);
router.use(`${API_VERSION}/sessions`, sessionRoutes);
router.use(API_VERSION, tsoaRouter);

export { router as apiRoutes };
