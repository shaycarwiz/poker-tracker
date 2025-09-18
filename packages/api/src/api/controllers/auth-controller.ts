import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { JWTService } from "../../shared/utils/jwt";
import { PlayerRepository } from "../../model/repositories";
import { Player } from "../../model/entities";
import { Money } from "../../model/value-objects";
import { logger } from "../../shared/utils/logger";

export class AuthController {
  constructor(private playerRepository: PlayerRepository) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { googleId, email, name } = req.body;

      if (!googleId || !email || !name) {
        res.status(400).json({
          error: "Missing required fields: googleId, email, name",
          code: "MISSING_FIELDS",
        });
        return;
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

      res.json({
        token,
        user: {
          id: player.id.value,
          name: player.name,
          email: player.email,
          currentBankroll: player.currentBankroll.amount,
          totalSessions: player.totalSessions,
        },
      });
    } catch (error) {
      logger.error(`Login error: ${error}`);
      res.status(500).json({
        error: "Internal server error",
        code: "LOGIN_ERROR",
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHORIZED",
        });
        return;
      }

      const player = await this.playerRepository.findByGoogleId(
        req.user.googleId
      );

      if (!player) {
        res.status(404).json({
          error: "Player not found",
          code: "PLAYER_NOT_FOUND",
        });
        return;
      }

      res.json({
        id: player.id.value,
        name: player.name,
        email: player.email,
        currentBankroll: player.currentBankroll.amount,
        totalSessions: player.totalSessions,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      });
    } catch (error) {
      logger.error(`Get profile error: ${error}`);
      res.status(500).json({
        error: "Internal server error",
        code: "PROFILE_ERROR",
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: "Authentication required",
          code: "UNAUTHORIZED",
        });
        return;
      }

      const { name, email } = req.body;
      const player = await this.playerRepository.findByGoogleId(
        req.user.googleId
      );

      if (!player) {
        res.status(404).json({
          error: "Player not found",
          code: "PLAYER_NOT_FOUND",
        });
        return;
      }

      if (name) {
        player.updateName(name);
      }

      if (email) {
        player.updateEmail(email);
      }

      await this.playerRepository.save(player);

      res.json({
        id: player.id.value,
        name: player.name,
        email: player.email,
        currentBankroll: player.currentBankroll.amount,
        totalSessions: player.totalSessions,
        updatedAt: player.updatedAt,
      });
    } catch (error) {
      logger.error(`Update profile error: ${error}`);
      res.status(500).json({
        error: "Internal server error",
        code: "UPDATE_PROFILE_ERROR",
      });
    }
  }
}
