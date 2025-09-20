// src/authentication.ts
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { logger } from "@/shared/utils/logger";

export async function expressAuthentication(
  request: Request,
  securityName: string,
  _?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const error = new Error("Access token required");
      (error as any).status = 401;
      (error as any).code = "MISSING_TOKEN";
      throw error;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        logger.error("JWT_SECRET not configured");
        const error = new Error("Server configuration error");
        (error as any).status = 500;
        (error as any).code = "CONFIG_ERROR";
        throw error;
      }

      const decoded = jwt.verify(token, secret) as any;

      // Return user information from the JWT payload
      return {
        googleId: decoded.googleId || decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };
    } catch (error) {
      logger.warn(`JWT verification failed: ${error}`);
      const authError = new Error("Invalid or expired token");
      (authError as any).status = 403;
      (authError as any).code = "INVALID_TOKEN";
      throw authError;
    }
  }
  throw new Error("Unsupported auth scheme");
}
