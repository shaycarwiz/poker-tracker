import jwt from "jsonwebtoken";
import { logger } from "./logger";

export interface JWTPayload {
  googleId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  googleId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  private static get secret(): string | undefined {
    return process.env.JWT_SECRET;
  }

  private static get refreshSecret(): string | undefined {
    return process.env["JWT_REFRESH_SECRET"] || process.env.JWT_SECRET;
  }

  private static get expiresIn(): string {
    return (process.env["JWT_EXPIRES_IN"] || "15m") as string;
  }

  private static get refreshExpiresIn(): string {
    return (process.env["JWT_REFRESH_EXPIRES_IN"] || "7d") as string;
  }

  static generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    if (!this.secret || this.secret === "undefined") {
      throw new Error("JWT_SECRET not configured");
    }

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as string,
      issuer: "poker-tracker-api",
      audience: "poker-tracker-web",
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): JWTPayload {
    if (!this.secret || this.secret === "undefined") {
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

  static generateRefreshToken(
    payload: Omit<RefreshTokenPayload, "iat" | "exp">
  ): string {
    if (!this.refreshSecret || this.refreshSecret === "undefined") {
      throw new Error("JWT refresh secret not configured");
    }

    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: "poker-tracker-api",
      audience: "poker-tracker-web",
    } as jwt.SignOptions);
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    if (!this.refreshSecret) {
      throw new Error("JWT refresh secret not configured");
    }

    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: "poker-tracker-api",
        audience: "poker-tracker-web",
      }) as RefreshTokenPayload;
    } catch (error) {
      logger.error(`Refresh token verification failed: ${error}`);
      throw new Error("Invalid refresh token");
    }
  }

  static generateTokenPair(userPayload: Omit<JWTPayload, "iat" | "exp">): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const tokenId =
      Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    // Add a unique identifier to ensure different access tokens
    const accessTokenPayload = {
      ...userPayload,
      jti: tokenId, // JWT ID for uniqueness
    };

    const accessToken = this.generateToken(accessTokenPayload);
    const refreshToken = this.generateRefreshToken({
      googleId: userPayload.googleId,
      tokenId,
    });

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpirationTime(this.expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private static parseExpirationTime(expiresIn: string): number {
    const timeUnits: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default to 15 minutes
    }

    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;
    return value * (timeUnits[unit] || 60);
  }
}
