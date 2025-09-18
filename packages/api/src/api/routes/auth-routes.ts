import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";
import { container } from "../../infrastructure/container";
import { authenticateToken } from "../middleware/auth";
import {
  validateLoginRequest,
  validateUpdateProfileRequest,
} from "../validators/auth-validators";

const router = Router();
const authController = new AuthController(container.playerRepository);

// Public routes
router.post(
  "/login",
  validateLoginRequest,
  authController.login.bind(authController)
);

// Protected routes
router.get(
  "/profile",
  authenticateToken,
  authController.getProfile.bind(authController)
);
router.put(
  "/profile",
  authenticateToken,
  validateUpdateProfileRequest,
  authController.updateProfile.bind(authController)
);

export { router as authRoutes };
