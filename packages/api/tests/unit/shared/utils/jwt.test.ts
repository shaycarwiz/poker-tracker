import {
  JWTService,
  JWTPayload,
  RefreshTokenPayload,
} from "@/shared/utils/jwt";

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    JWT_SECRET: "test-secret",
    JWT_REFRESH_SECRET: "test-refresh-secret",
    JWT_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("JWTService", () => {
  const mockPayload: Omit<JWTPayload, "iat" | "exp"> = {
    googleId: "test-google-id",
    email: "test@example.com",
    name: "Test User",
  };

  const mockRefreshPayload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
    googleId: "test-google-id",
    tokenId: "test-token-id",
  };

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = JWTService.generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should throw error when JWT_SECRET is not configured", () => {
      delete process.env.JWT_SECRET;

      expect(() => {
        JWTService.generateToken(mockPayload);
      }).toThrow("JWT_SECRET not configured");
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const token = JWTService.generateToken(mockPayload);
      const decoded = JWTService.verifyToken(token);

      expect(decoded.googleId).toBe(mockPayload.googleId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.name).toBe(mockPayload.name);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        JWTService.verifyToken("invalid-token");
      }).toThrow("Invalid token");
    });

    it("should throw error when JWT_SECRET is not configured", () => {
      delete process.env.JWT_SECRET;

      expect(() => {
        JWTService.verifyToken("some-token");
      }).toThrow("JWT_SECRET not configured");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      const refreshToken = JWTService.generateRefreshToken(mockRefreshPayload);

      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe("string");
      expect(refreshToken.split(".")).toHaveLength(3);
    });

    it("should throw error when refresh secret is not configured", () => {
      delete process.env["JWT_REFRESH_SECRET"];
      delete process.env.JWT_SECRET;

      expect(() => {
        JWTService.generateRefreshToken(mockRefreshPayload);
      }).toThrow("JWT refresh secret not configured");
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token", () => {
      const refreshToken = JWTService.generateRefreshToken(mockRefreshPayload);
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      expect(decoded.googleId).toBe(mockRefreshPayload.googleId);
      expect(decoded.tokenId).toBe(mockRefreshPayload.tokenId);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it("should throw error for invalid refresh token", () => {
      expect(() => {
        JWTService.verifyRefreshToken("invalid-refresh-token");
      }).toThrow("Invalid refresh token");
    });
  });

  describe("generateTokenPair", () => {
    it("should generate both access and refresh tokens", () => {
      const tokenPair = JWTService.generateTokenPair(mockPayload);

      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.expiresIn).toBeDefined();
      expect(typeof tokenPair.expiresIn).toBe("number");
      expect(tokenPair.expiresIn).toBeGreaterThan(0);
    });

    it("should generate different tokens for each call", () => {
      const tokenPair1 = JWTService.generateTokenPair(mockPayload);
      const tokenPair2 = JWTService.generateTokenPair(mockPayload);

      expect(tokenPair1.accessToken).not.toBe(tokenPair2.accessToken);
      expect(tokenPair1.refreshToken).not.toBe(tokenPair2.refreshToken);
    });
  });

  describe("decodeToken", () => {
    it("should decode a valid token", () => {
      const token = JWTService.generateToken(mockPayload);
      const decoded = JWTService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.googleId).toBe(mockPayload.googleId);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.name).toBe(mockPayload.name);
    });

    it("should return null for invalid token", () => {
      const decoded = JWTService.decodeToken("invalid-token");
      expect(decoded).toBeNull();
    });
  });
});
