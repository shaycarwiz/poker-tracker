import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../../shared/utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: {
    googleId: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      error: "Access token required",
      code: "MISSING_TOKEN",
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT_SECRET not configured");
      res.status(500).json({
        error: "Server configuration error",
        code: "CONFIG_ERROR",
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as any;

    // Extract user information from the JWT payload
    req.user = {
      googleId: decoded.googleId || decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    logger.warn(`JWT verification failed: ${error}`);
    res.status(403).json({
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, secret) as any;

    req.user = {
      googleId: decoded.googleId || decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens
    logger.warn(`Optional JWT verification failed: ${error}`);
    next();
  }
};
