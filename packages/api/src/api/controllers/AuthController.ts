import {
  Controller,
  Post,
  Get,
  Put,
  Route,
  Tags,
  Security,
  Body,
  Request,
} from "tsoa";
import { injectable, inject } from "tsyringe";
import { JWTService } from "@/shared/utils/jwt";
import { UserId } from "@/model/entities";
import { UserRepository } from "@/model/repositories";
import { UserService } from "@/application/services/user-service";
import logger from "@/shared/utils/logger";
import {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "../types";

@Route("auth")
@Tags("Authentication")
@injectable()
export class AuthController extends Controller {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository,
    @inject("UserService") private userService: UserService
  ) {
    super();
  }

  @Post("login")
  public async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    try {
      const { googleId, email, name } = body;

      const validationErrors: string[] = [];

      if (!googleId || typeof googleId !== "string" || googleId.trim() === "") {
        validationErrors.push(
          "Google ID is required and must be a non-empty string"
        );
      }

      if (!email || typeof email !== "string" || !this.isValidEmail(email)) {
        validationErrors.push("Valid email is required");
      }

      if (!name || typeof name !== "string" || name.trim() === "") {
        validationErrors.push(
          "Name is required and must be a non-empty string"
        );
      } else if (name.length > 100) {
        validationErrors.push("Name must be between 1 and 100 characters");
      }

      if (validationErrors.length > 0) {
        this.setStatus(400);
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const authResult = await this.userService.loginOrRegister({
        googleId,
        email,
        name,
      });

      const tokenPair = JWTService.generateTokenPair({
        userId: authResult.userId,
        googleId,
        email: authResult.email,
        name: authResult.name,
      });

      return {
        token: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        user: {
          id: authResult.userId,
          name: authResult.name,
          email: authResult.email,
          defaultPlayerId: authResult.defaultPlayerId,
        },
      };
    } catch (error) {
      logger.error(`Login error: ${error}`);
      this.setStatus(500);
      throw new Error("Internal server error");
    }
  }

  @Get("profile")
  @Security("jwt")
  public async getProfile(@Request() request: any): Promise<ProfileResponse> {
    try {
      if (!request.user?.userId) {
        this.setStatus(401);
        throw new Error("Authentication required");
      }

      const profile = await this.userService.getProfile(request.user.userId);

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        defaultPlayerId: profile.defaultPlayerId,
        preferredLanguage: profile.preferredLanguage,
        defaultCurrency: profile.defaultCurrency,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error(`Get profile error: ${error}`);
      this.setStatus(500);
      throw new Error("Internal server error");
    }
  }

  @Put("profile")
  @Security("jwt")
  public async updateProfile(
    @Body() body: UpdateProfileRequest,
    @Request() request: any
  ): Promise<ProfileResponse> {
    try {
      if (!request.user?.userId) {
        this.setStatus(401);
        throw new Error("Authentication required");
      }

      const { name, email } = body;
      const validationErrors: string[] = [];

      if (name !== undefined) {
        if (typeof name !== "string" || name.trim() === "") {
          validationErrors.push("Name must be a non-empty string");
        } else if (name.length > 100) {
          validationErrors.push("Name must be between 1 and 100 characters");
        }
      }

      if (email !== undefined) {
        if (typeof email !== "string" || !this.isValidEmail(email)) {
          validationErrors.push("Valid email is required");
        }
      }

      if (validationErrors.length > 0) {
        this.setStatus(400);
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      const profile = await this.userService.updateProfile(
        request.user.userId,
        { name, email }
      );

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        defaultPlayerId: profile.defaultPlayerId,
        preferredLanguage: profile.preferredLanguage,
        defaultCurrency: profile.defaultCurrency,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error(`Update profile error: ${error}`);
      this.setStatus(500);
      throw new Error("Internal server error");
    }
  }

  @Post("refresh")
  public async refreshToken(
    @Body() body: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    try {
      const { refreshToken } = body;

      if (
        !refreshToken ||
        typeof refreshToken !== "string" ||
        refreshToken.trim() === ""
      ) {
        this.setStatus(400);
        throw new Error("Refresh token is required");
      }

      const refreshPayload = JWTService.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(
        new UserId(refreshPayload.userId)
      );

      if (!user) {
        this.setStatus(404);
        throw new Error("User not found");
      }

      const tokenPair = JWTService.generateTokenPair({
        userId: user.id.value,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
      });

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
      };
    } catch (error) {
      logger.error(`Token refresh error: ${error}`);
      if (
        error instanceof Error &&
        error.message.includes("Invalid refresh token")
      ) {
        this.setStatus(401);
        throw new Error("Invalid or expired refresh token");
      }
      this.setStatus(500);
      throw new Error("Internal server error");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
