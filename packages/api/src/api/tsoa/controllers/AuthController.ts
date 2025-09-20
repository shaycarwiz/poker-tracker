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
import { PlayerRepository } from "@/model/repositories";
import { Player } from "@/model/entities";
import logger from "@/shared/utils/logger";
import {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
} from "../types";

/**
 * Authentication Controller
 *
 * Handles user authentication, profile management, and JWT token generation.
 */
@Route("auth")
@Tags("Authentication")
@injectable()
export class AuthController extends Controller {
  constructor(
    @inject("PlayerRepository") private playerRepository: PlayerRepository
  ) {
    super();
  }

  /**
   * Login with Google OAuth credentials
   */
  @Post("login")
  public async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    try {
      const { googleId, email, name } = body;

      // Validation
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

      // Check if player exists by Google ID
      let player = await this.playerRepository.findByGoogleId(googleId);

      if (!player) {
        // Check if player exists by email (for account linking)
        const existingPlayer = await this.playerRepository.findByEmail(email);

        if (existingPlayer) {
          // Link Google account to existing player
          existingPlayer.linkGoogleAccount(googleId);
          await this.playerRepository.save(existingPlayer);
          player = existingPlayer;
        } else {
          // Create new player from Google account
          player = Player.createFromGoogle(googleId, name, email);
          await this.playerRepository.save(player);
        }
      }

      // Generate JWT token
      const token = JWTService.generateToken({
        googleId: player.googleId!,
        email: player.email!,
        name: player.name,
      });

      return {
        token,
        user: {
          id: player.id.value,
          name: player.name,
          email: player.email || "",
          currentBankroll: player.currentBankroll.amount,
          totalSessions: player.totalSessions,
        },
      };
    } catch (error) {
      logger.error(`Login error: ${error}`);
      this.setStatus(500);
      throw new Error("Internal server error");
    }
  }

  /**
   * Get authenticated user's profile information
   */
  @Get("profile")
  @Security("jwt")
  public async getProfile(@Request() request: any): Promise<ProfileResponse> {
    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error("Authentication required");
      }

      const player = await this.playerRepository.findByGoogleId(
        request.user.googleId
      );

      if (!player) {
        this.setStatus(404);
        throw new Error("Player not found");
      }

      return {
        id: player.id.value,
        name: player.name,
        email: player.email || "",
        currentBankroll: player.currentBankroll.amount,
        totalSessions: player.totalSessions,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      };
    } catch (error) {
      logger.error(`Get profile error: ${error}`);
      this.setStatus(500);
      throw new Error("Internal server error");
    }
  }

  /**
   * Update authenticated user's profile information
   */
  @Put("profile")
  @Security("jwt")
  public async updateProfile(
    @Body() body: UpdateProfileRequest,
    @Request() request: any
  ): Promise<ProfileResponse> {
    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error("Authentication required");
      }

      const { name, email } = body;

      // Validation
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

      const player = await this.playerRepository.findByGoogleId(
        request.user.googleId
      );

      if (!player) {
        this.setStatus(404);
        throw new Error("Player not found");
      }

      if (name) {
        player.updateName(name);
      }

      if (email) {
        player.updateEmail(email);
      }

      await this.playerRepository.save(player);

      return {
        id: player.id.value,
        name: player.name,
        email: player.email || "",
        currentBankroll: player.currentBankroll.amount,
        totalSessions: player.totalSessions,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      };
    } catch (error) {
      logger.error(`Update profile error: ${error}`);
      this.setStatus(500);
      throw new Error("Internal server error");
    }
  }

  /**
   * Helper method to validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
