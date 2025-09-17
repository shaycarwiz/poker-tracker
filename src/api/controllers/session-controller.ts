import { Request, Response } from "express";
import { container } from "../../infrastructure/container";
import { logger } from "../../shared/utils/logger";
import { config } from "../../infrastructure/config";
import {
  AddTransactionRequest,
  EndSessionRequest,
  ListSessionsRequest,
  StartSessionRequest,
  UpdateSessionNotesRequest,
} from "../../application/dto/session-dto";

export class SessionController {
  private sessionService = container.services.sessions;

  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const { playerId, location, stakes, initialBuyIn, notes } = req.body;

      if (!playerId || typeof playerId !== "string") {
        res.status(400).json({
          error: "Player ID is required and must be a string",
        });

        return;
      }

      if (!location || typeof location !== "string") {
        res.status(400).json({
          error: "Location is required and must be a string",
        });

        return;
      }

      if (!stakes || !stakes.smallBlind || !stakes.bigBlind) {
        res.status(400).json({
          error: "Stakes with smallBlind and bigBlind are required",
        });

        return;
      }

      if (!initialBuyIn || typeof initialBuyIn.amount !== "number") {
        res.status(400).json({
          error: "Initial buy-in amount is required and must be a number",
        });

        return;
      }

      const request: StartSessionRequest = {
        playerId,
        location,
        stakes: {
          smallBlind: stakes.smallBlind,
          bigBlind: stakes.bigBlind,
          currency: stakes.currency || config.poker.defaultCurrency,
        },
        initialBuyIn: {
          amount: initialBuyIn.amount,
          currency: initialBuyIn.currency || config.poker.defaultCurrency,
        },
        notes,
      };

      const response = await this.sessionService.startSession(request);

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error starting session", { error, body: req.body });
      res.status(500).json({
        error: "Failed to start session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { finalCashOut, notes } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Session ID is required",
        });

        return;
      }

      if (!finalCashOut || typeof finalCashOut.amount !== "number") {
        res.status(400).json({
          error: "Final cash out amount is required and must be a number",
        });

        return;
      }

      const request: EndSessionRequest = {
        sessionId: id,
        finalCashOut: {
          amount: finalCashOut.amount,
          currency: finalCashOut.currency || config.poker.defaultCurrency,
        },
        notes,
      };

      const response = await this.sessionService.endSession(request);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error ending session", {
        error,
        params: req.params,
        body: req.body,
      });
      if (error instanceof Error && error.message === "Session not found") {
        res.status(404).json({
          error: "Session not found",
        });

        return;
      }
      res.status(500).json({
        error: "Failed to end session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async addTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type, amount, notes } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Session ID is required",
        });

        return;
      }

      if (!type || typeof type !== "string") {
        res.status(400).json({
          error: "Transaction type is required and must be a string",
        });

        return;
      }

      if (!amount || typeof amount.amount !== "number") {
        res.status(400).json({
          error: "Amount is required and must be a number",
        });

        return;
      }

      const request: AddTransactionRequest = {
        sessionId: id,
        type,
        amount: {
          amount: amount.amount,
          currency: amount.currency || config.poker.defaultCurrency,
        },
        description: notes,
      };

      const response = await this.sessionService.addTransaction(request);

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error adding transaction", {
        error,
        params: req.params,
        body: req.body,
      });
      if (error instanceof Error && error.message === "Session not found") {
        res.status(404).json({
          error: "Session not found",
        });

        return;
      }
      res.status(500).json({
        error: "Failed to add transaction",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Session ID is required",
        });

        return;
      }

      const response = await this.sessionService.getSession(id);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error getting session", { error, params: req.params });
      if (error instanceof Error && error.message === "Session not found") {
        res.status(404).json({
          error: "Session not found",
        });

        return;
      }
      res.status(500).json({
        error: "Failed to get session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async listSessions(req: Request, res: Response): Promise<void> {
    try {
      const { playerId, status, page, limit, startDate, endDate } = req.query;

      const request: ListSessionsRequest = {
        playerId: playerId as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const response = await this.sessionService.listSessions(request);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error listing sessions", { error, query: req.query });
      res.status(500).json({
        error: "Failed to list sessions",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async cancelSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Session ID is required",
        });

        return;
      }

      const request: EndSessionRequest = {
        sessionId: id,
        finalCashOut: { amount: 0, currency: config.poker.defaultCurrency },
        notes: req.body.reason || "Session cancelled",
      };

      const response = await this.sessionService.endSession(request);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error cancelling session", { error, params: req.params });
      res.status(500).json({
        error: "Failed to cancel session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateSessionNotes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Session ID is required",
        });

        return;
      }

      if (!notes || typeof notes !== "string") {
        res.status(400).json({
          error: "Notes are required and must be a string",
        });

        return;
      }

      const request: UpdateSessionNotesRequest = {
        sessionId: id,
        notes,
      };

      const response = await this.sessionService.updateSessionNotes(request);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error updating session notes", {
        error,
        params: req.params,
        body: req.body,
      });
      if (error instanceof Error && error.message === "Session not found") {
        res.status(404).json({
          error: "Session not found",
        });

        return;
      }
      if (error instanceof Error && error.message === "Session is not active") {
        res.status(400).json({
          error: "Session is not active",
        });

        return;
      }
      res.status(500).json({
        error: "Failed to update session notes",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getPlayerSessions(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      if (!playerId) {
        res.status(400).json({
          error: "Player ID is required",
        });

        return;
      }

      const request: ListSessionsRequest = {
        playerId,
        page: 1,
        limit: 100,
      };

      const response = await this.sessionService.listSessions(request);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error getting player sessions", {
        error,
        params: req.params,
      });
      res.status(500).json({
        error: "Failed to get player sessions",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getActiveSession(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      if (!playerId) {
        res.status(400).json({
          error: "Player ID is required",
        });

        return;
      }

      const request: ListSessionsRequest = {
        playerId,
        status: "active",
        page: 1,
        limit: 1,
      };

      const response = await this.sessionService.listSessions(request);

      res.status(200).json({
        success: true,
        data: response.sessions[0] || null,
      });
    } catch (error) {
      logger.error("Error getting active session", {
        error,
        params: req.params,
      });
      res.status(500).json({
        error: "Failed to get active session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
