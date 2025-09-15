import { Request, Response } from "express";
import { container } from "../../infrastructure/container";
import { logger } from "../../shared/utils/logger";
import { config } from "../../infrastructure/config";
import {
  CreatePlayerRequest,
  UpdatePlayerRequest,
  AddBankrollRequest,
} from "../../application/dto/player-dto";

export class PlayerController {
  private playerService = container.services.players;

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
