import { Request, Response } from "express";
import { PlayerId } from "../../model/entities";
import { Money } from "../../model/value-objects";
import { container } from "../../infrastructure/container";
import { logger } from "../../shared/utils/logger";

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

      const initialBankrollMoney = initialBankroll
        ? new Money(initialBankroll.amount, initialBankroll.currency || "USD")
        : undefined;

      const player = await this.playerService.createPlayer(
        name,
        email,
        initialBankrollMoney
      );

      res.status(201).json({
        success: true,
        data: {
          id: player.id.value,
          name: player.name,
          email: player.email,
          currentBankroll: player.currentBankroll.toString(),
          totalSessions: player.totalSessions,
          createdAt: player.createdAt.toISOString(),
          updatedAt: player.updatedAt.toISOString(),
        },
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

      const playerId = new PlayerId(id);
      const player = await this.playerService.getPlayerById(playerId);

      if (!player) {
        res.status(404).json({
          error: "Player not found",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: player.id.value,
          name: player.name,
          email: player.email,
          currentBankroll: player.currentBankroll.toString(),
          totalSessions: player.totalSessions,
          createdAt: player.createdAt.toISOString(),
          updatedAt: player.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      logger.error("Error getting player", { error, params: req.params });
      res.status(500).json({
        error: "Failed to get player",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAllPlayers(_: Request, res: Response): Promise<void> {
    try {
      const players = await this.playerService.getAllPlayers();

      res.json({
        success: true,
        data: players.map((player) => ({
          id: player.id.value,
          name: player.name,
          email: player.email,
          currentBankroll: player.currentBankroll.toString(),
          totalSessions: player.totalSessions,
          createdAt: player.createdAt.toISOString(),
          updatedAt: player.updatedAt.toISOString(),
        })),
      });
    } catch (error) {
      logger.error("Error getting all players", { error });
      res.status(500).json({
        error: "Failed to get players",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async searchPlayers(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.query;

      if (!name || typeof name !== "string") {
        res.status(400).json({
          error: "Name query parameter is required",
        });
        return;
      }

      const players = await this.playerService.searchPlayersByName(name);

      res.json({
        success: true,
        data: players.map((player) => ({
          id: player.id.value,
          name: player.name,
          email: player.email,
          currentBankroll: player.currentBankroll.toString(),
          totalSessions: player.totalSessions,
          createdAt: player.createdAt.toISOString(),
          updatedAt: player.updatedAt.toISOString(),
        })),
      });
    } catch (error) {
      logger.error("Error searching players", { error, query: req.query });
      res.status(500).json({
        error: "Failed to search players",
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

      const playerId = new PlayerId(id);
      const money = new Money(amount, currency || "USD");

      await this.playerService.updatePlayerBankroll(playerId, money);

      res.json({
        success: true,
        message: "Player bankroll updated successfully",
      });
    } catch (error) {
      logger.error("Error updating player bankroll", {
        error,
        params: req.params,
        body: req.body,
      });
      res.status(500).json({
        error: "Failed to update player bankroll",
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

      const playerId = new PlayerId(id);
      const stats = await this.playerService.getPlayerStats(playerId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Error getting player stats", { error, params: req.params });
      res.status(500).json({
        error: "Failed to get player stats",
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

      const playerId = new PlayerId(id);
      await this.playerService.deletePlayer(playerId);

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
