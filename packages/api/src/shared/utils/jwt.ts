import jwt from "jsonwebtoken";
import { logger } from "./logger";

export interface JWTPayload {
  googleId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private static readonly secret = process.env.JWT_SECRET;
  private static readonly expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  static generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    if (!this.secret) {
      throw new Error("JWT_SECRET not configured");
    }

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: "poker-tracker-api",
      audience: "poker-tracker-web",
    });
  }

  static verifyToken(token: string): JWTPayload {
    if (!this.secret) {
      throw new Error("JWT_SECRET not configured");
    }

    try {
      return jwt.verify(token, this.secret, {
        issuer: "poker-tracker-api",
        audience: "poker-tracker-web",
      }) as JWTPayload;
    } catch (error) {
      logger.error(`JWT verification failed: ${error}`);
      throw new Error("Invalid token");
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      logger.error(`JWT decode failed: ${error}`);
      return null;
    }
  }
}
