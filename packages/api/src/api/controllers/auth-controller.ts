import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { JWTService } from "../../shared/utils/jwt";
import { PlayerRepository } from "../../model/repositories";
import { Player } from "../../model/entities";
import { logger } from "../../shared/utils/logger";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - googleId
 *         - email
 *         - name
 *       properties:
 *         googleId:
 *           type: string
 *           description: Google OAuth ID
 *           example: "1234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john@example.com"
 *         name:
 *           type: string
 *           description: User's display name
 *           example: "John Doe"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: Player ID
 *               example: "123e4567-e89b-12d3-a456-426614174000"
 *             name:
 *               type: string
 *               description: Player name
 *               example: "John Doe"
 *             email:
 *               type: string
 *               format: email
 *               description: Player email
 *               example: "john@example.com"
 *             currentBankroll:
 *               type: number
 *               description: Current bankroll amount
 *               example: 1000
 *             totalSessions:
 *               type: number
 *               description: Total number of sessions
 *               example: 5
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Player ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           description: Player name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Player email
 *           example: "john@example.com"
 *         currentBankroll:
 *           type: number
 *           description: Current bankroll amount
 *           example: 1000
 *         totalSessions:
 *           type: number
 *           description: Total number of sessions
 *           example: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2024-01-01T00:00:00.000Z"
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated player name
 *           example: "John Smith"
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email address
 *           example: "johnsmith@example.com"
 *     AuthError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Authentication required"
 *         code:
 *           type: string
 *           description: Error code
 *           example: "UNAUTHORIZED"
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtained from login endpoint
 */

export class AuthController {
  constructor(private playerRepository: PlayerRepository) {}

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Login with Google OAuth
   *     description: Authenticate user with Google OAuth credentials and return JWT token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Bad request - missing required fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Missing required fields: googleId, email, name"
   *               code: "MISSING_FIELDS"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Internal server error"
   *               code: "LOGIN_ERROR"
   */
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

  /**
   * @swagger
   * /auth/profile:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Get user profile
   *     description: Retrieve the authenticated user's profile information
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProfileResponse'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Authentication required"
   *               code: "UNAUTHORIZED"
   *       404:
   *         description: Player not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Player not found"
   *               code: "PLAYER_NOT_FOUND"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Internal server error"
   *               code: "PROFILE_ERROR"
   */
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

  /**
   * @swagger
   * /auth/profile:
   *   put:
   *     tags:
   *       - Authentication
   *     summary: Update user profile
   *     description: Update the authenticated user's profile information
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProfileRequest'
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProfileResponse'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Authentication required"
   *               code: "UNAUTHORIZED"
   *       404:
   *         description: Player not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Player not found"
   *               code: "PLAYER_NOT_FOUND"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthError'
   *             example:
   *               error: "Internal server error"
   *               code: "UPDATE_PROFILE_ERROR"
   */
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
