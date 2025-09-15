import { Request, Response } from "express";
import { container } from "../../infrastructure/container";
import { logger } from "../../shared/utils/logger";
import { config } from "../../infrastructure/config";
import {
  CreatePlayerRequest,
  UpdatePlayerRequest,
  AddBankrollRequest,
} from "../../application/dto/player-dto";

/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the player
 *         name:
 *           type: string
 *           description: Player's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Player's email address
 *           example: "john.doe@example.com"
 *         bankroll:
 *           type: number
 *           description: Player's current bankroll
 *           example: 1000.50
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the player was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the player was last updated
 *     CreatePlayerRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           description: Player's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Player's email address
 *           example: "john.doe@example.com"
 *         initialBankroll:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               description: Initial bankroll amount
 *               example: 1000.00
 *             currency:
 *               type: string
 *               description: Currency code
 *               example: "USD"
 *     UpdatePlayerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Player's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Player's email address
 *           example: "john.doe@example.com"
 *     AddBankrollRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount to add to bankroll
 *           example: 500.00
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "USD"
 *         reason:
 *           type: string
 *           description: Optional note about the transaction
 *           example: "Initial deposit"
 *     PlayerStats:
 *       type: object
 *       properties:
 *         playerId:
 *           type: string
 *           format: uuid
 *           description: Player's unique identifier
 *         totalSessions:
 *           type: integer
 *           description: Total number of poker sessions
 *         totalWinnings:
 *           type: number
 *           description: Total winnings across all sessions
 *         winRate:
 *           type: number
 *           description: Win rate percentage
 *         averageSession:
 *           type: number
 *           description: Average winnings per session
 */

export class PlayerController {
  private playerService = container.services.players;

  /**
   * @swagger
   * /api/players:
   *   post:
   *     summary: Create a new player
   *     description: Add a new player to the system
   *     tags: [Players]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePlayerRequest'
   *     responses:
   *       201:
   *         description: Player created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Player'
   *       400:
   *         description: Bad request - validation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async createPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, initialBankroll } = req.body;

      if (!name || typeof name !== "string") {
        res.status(400).json({
          error: "Name is required and must be a string",
        });
        return;
      }

      const request: CreatePlayerRequest = {
        name,
        email,
        initialBankroll: initialBankroll
          ? {
              amount: initialBankroll.amount,
              currency:
                initialBankroll.currency || config.poker.defaultCurrency,
            }
          : {
              amount: 0,
              currency: config.poker.defaultCurrency,
            },
      };

      const response = await this.playerService.createPlayer(request);

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error creating player", { error, body: req.body });
      res.status(500).json({
        error: "Failed to create player",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players/{id}:
   *   get:
   *     summary: Get player by ID
   *     description: Retrieve a specific player by their unique identifier
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Player's unique identifier
   *     responses:
   *       200:
   *         description: Player retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Player'
   *       400:
   *         description: Bad request - player ID required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       404:
   *         description: Player not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Player ID is required",
        });
        return;
      }

      const response = await this.playerService.getPlayer(id);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error getting player", { error, params: req.params });
      if (error instanceof Error && error.message === "Player not found") {
        res.status(404).json({
          error: "Player not found",
        });
        return;
      }
      res.status(500).json({
        error: "Failed to get player",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players:
   *   get:
   *     summary: Get all players
   *     description: Retrieve a list of all players in the system with pagination
   *     tags: [Players]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of players per page
   *     responses:
   *       200:
   *         description: List of players retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     players:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Player'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getAllPlayers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 10;

      const response = await this.playerService.getAllPlayers(page, limit);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error getting all players", { error });
      res.status(500).json({
        error: "Failed to get players",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players/{id}:
   *   put:
   *     summary: Update player by ID
   *     description: Update an existing player's information
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Player's unique identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePlayerRequest'
   *     responses:
   *       200:
   *         description: Player updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Player'
   *       400:
   *         description: Bad request - validation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       404:
   *         description: Player not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async updatePlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Player ID is required",
        });
        return;
      }

      const request: UpdatePlayerRequest = {
        id,
        name,
        email,
      };

      const response = await this.playerService.updatePlayer(request);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error updating player", {
        error,
        params: req.params,
        body: req.body,
      });
      if (error instanceof Error && error.message === "Player not found") {
        res.status(404).json({
          error: "Player not found",
        });
        return;
      }
      res.status(500).json({
        error: "Failed to update player",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players/{id}/bankroll:
   *   post:
   *     summary: Add to player's bankroll
   *     description: Add funds to a player's bankroll
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Player's unique identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AddBankrollRequest'
   *     responses:
   *       200:
   *         description: Bankroll added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Player'
   *       400:
   *         description: Bad request - validation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       404:
   *         description: Player not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async addToBankroll(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, currency, reason } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Player ID is required",
        });
        return;
      }

      if (!amount || typeof amount !== "number") {
        res.status(400).json({
          error: "Amount is required and must be a number",
        });
        return;
      }

      const request: AddBankrollRequest = {
        playerId: id,
        amount: {
          amount,
          currency: currency || config.poker.defaultCurrency,
        },
        reason,
      };

      const response = await this.playerService.addToBankroll(request);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error adding to bankroll", {
        error,
        params: req.params,
        body: req.body,
      });
      if (error instanceof Error && error.message === "Player not found") {
        res.status(404).json({
          error: "Player not found",
        });
        return;
      }
      res.status(500).json({
        error: "Failed to add to bankroll",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players/search:
   *   get:
   *     summary: Search players
   *     description: Search for players by name or email
   *     tags: [Players]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query (name or email)
   *     responses:
   *       200:
   *         description: Search results retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     players:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Player'
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *       400:
   *         description: Bad request - search query required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async searchPlayers(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        res.status(400).json({
          error: "Search query is required",
        });
        return;
      }

      // For now, return empty results - implement search logic later
      res.json({
        success: true,
        data: {
          players: [],
          total: 0,
          page: 1,
          limit: 10,
        },
      });
    } catch (error) {
      logger.error("Error searching players", { error, query: req.query });
      res.status(500).json({
        error: "Failed to search players",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players/{id}/stats:
   *   get:
   *     summary: Get player statistics
   *     description: Retrieve statistics for a specific player
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Player's unique identifier
   *     responses:
   *       200:
   *         description: Player statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/PlayerStats'
   *       400:
   *         description: Bad request - player ID required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async getPlayerStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Player ID is required",
        });
        return;
      }

      // For now, return basic stats - implement stats logic later
      res.json({
        success: true,
        data: {
          playerId: id,
          totalSessions: 0,
          totalWinnings: 0,
          winRate: 0,
          averageSession: 0,
        },
      });
    } catch (error) {
      logger.error("Error getting player stats", { error, params: req.params });
      res.status(500).json({
        error: "Failed to get player stats",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players/{id}/bankroll:
   *   put:
   *     summary: Update player's bankroll
   *     description: Update a player's bankroll amount
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Player's unique identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AddBankrollRequest'
   *     responses:
   *       200:
   *         description: Bankroll updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Player'
   *       400:
   *         description: Bad request - validation failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       404:
   *         description: Player not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async updatePlayerBankroll(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, currency } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Player ID is required",
        });
        return;
      }

      if (!amount || typeof amount !== "number") {
        res.status(400).json({
          error: "Amount is required and must be a number",
        });
        return;
      }

      const request: AddBankrollRequest = {
        playerId: id,
        amount: {
          amount,
          currency: currency || config.poker.defaultCurrency,
        },
        reason: "Manual bankroll update",
      };

      const response = await this.playerService.addToBankroll(request);

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error updating player bankroll", {
        error,
        params: req.params,
        body: req.body,
      });
      if (error instanceof Error && error.message === "Player not found") {
        res.status(404).json({
          error: "Player not found",
        });
        return;
      }
      res.status(500).json({
        error: "Failed to update player bankroll",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * @swagger
   * /api/players/{id}:
   *   delete:
   *     summary: Delete player by ID
   *     description: Remove a player from the system
   *     tags: [Players]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Player's unique identifier
   *     responses:
   *       200:
   *         description: Player deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Player deleted successfully"
   *       400:
   *         description: Bad request - player ID required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async deletePlayer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Player ID is required",
        });
        return;
      }

      // For now, return success - implement delete logic later
      res.json({
        success: true,
        message: "Player deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting player", { error, params: req.params });
      res.status(500).json({
        error: "Failed to delete player",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
