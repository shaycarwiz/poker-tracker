import { Request, Response } from "express";
import { PlayerId, SessionId } from "../../model/entities";
import { Money, Stakes } from "../../model/value-objects";
import { TransactionType } from "../../model/enums";
import { container } from "../../infrastructure/container";
import { logger } from "../../shared/utils/logger";

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

      const playerIdObj = new PlayerId(playerId);
      const stakesObj = new Stakes(
        new Money(
          stakes.smallBlind.amount,
          stakes.smallBlind.currency || "USD"
        ),
        new Money(stakes.bigBlind.amount, stakes.bigBlind.currency || "USD")
      );
      const initialBuyInMoney = new Money(
        initialBuyIn.amount,
        initialBuyIn.currency || "USD"
      );

      const session = await this.sessionService.startSession(
        playerIdObj,
        location,
        stakesObj,
        initialBuyInMoney,
        notes
      );

      res.status(201).json({
        success: true,
        data: {
          id: session.id.value,
          playerId: session.playerId.value,
          location: session.location,
          stakes: session.stakes.formatted,
          startTime: session.startTime.toISOString(),
          status: session.status,
          totalBuyIn: session.totalBuyIn.toString(),
          totalCashOut: session.totalCashOut.toString(),
          netResult: session.netResult.toString(),
          notes: session.notes,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        },
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

      const sessionId = new SessionId(id);
      const finalCashOutMoney = new Money(
        finalCashOut.amount,
        finalCashOut.currency || "USD"
      );

      await this.sessionService.endSession(sessionId, finalCashOutMoney, notes);

      res.json({
        success: true,
        message: "Session ended successfully",
      });
    } catch (error) {
      logger.error("Error ending session", {
        error,
        params: req.params,
        body: req.body,
      });
      res.status(500).json({
        error: "Failed to end session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async addTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type, amount, description, notes } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Session ID is required",
        });
        return;
      }

      if (!type || !Object.values(TransactionType).includes(type)) {
        res.status(400).json({
          error: "Valid transaction type is required",
        });
        return;
      }

      if (!amount || typeof amount.amount !== "number") {
        res.status(400).json({
          error: "Amount is required and must be a number",
        });
        return;
      }

      const sessionId = new SessionId(id);
      const amountMoney = new Money(amount.amount, amount.currency || "USD");

      await this.sessionService.addTransaction(
        sessionId,
        type,
        amountMoney,
        description,
        notes
      );

      res.json({
        success: true,
        message: "Transaction added successfully",
      });
    } catch (error) {
      logger.error("Error adding transaction", {
        error,
        params: req.params,
        body: req.body,
      });
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

      const sessionId = new SessionId(id);
      const session = await this.sessionService.getSessionById(sessionId);

      if (!session) {
        res.status(404).json({
          error: "Session not found",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: session.id.value,
          playerId: session.playerId.value,
          location: session.location,
          stakes: session.stakes.formatted,
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString(),
          status: session.status,
          totalBuyIn: session.totalBuyIn.toString(),
          totalCashOut: session.totalCashOut.toString(),
          netResult: session.netResult.toString(),
          duration: session.duration?.minutes || 0,
          hourlyRate: session.hourlyRate?.toString(),
          bigBlindsWon: session.bigBlindsWon,
          notes: session.notes,
          transactions: session.transactions.map((t) => ({
            id: t.id.value,
            type: t.type,
            amount: t.amount.toString(),
            timestamp: t.timestamp.toISOString(),
            description: t.description,
            notes: t.notes,
          })),
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      logger.error("Error getting session", { error, params: req.params });
      res.status(500).json({
        error: "Failed to get session",
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

      const playerIdObj = new PlayerId(playerId);
      const sessions = await this.sessionService.getPlayerSessions(playerIdObj);

      res.json({
        success: true,
        data: sessions.map((session) => ({
          id: session.id.value,
          playerId: session.playerId.value,
          location: session.location,
          stakes: session.stakes.formatted,
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString(),
          status: session.status,
          totalBuyIn: session.totalBuyIn.toString(),
          totalCashOut: session.totalCashOut.toString(),
          netResult: session.netResult.toString(),
          duration: session.duration?.minutes || 0,
          hourlyRate: session.hourlyRate?.toString(),
          bigBlindsWon: session.bigBlindsWon,
          notes: session.notes,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        })),
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

      const playerIdObj = new PlayerId(playerId);
      const session = await this.sessionService.getActiveSession(playerIdObj);

      if (!session) {
        res.status(404).json({
          error: "No active session found for this player",
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: session.id.value,
          playerId: session.playerId.value,
          location: session.location,
          stakes: session.stakes.formatted,
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString(),
          status: session.status,
          totalBuyIn: session.totalBuyIn.toString(),
          totalCashOut: session.totalCashOut.toString(),
          netResult: session.netResult.toString(),
          duration: session.duration?.minutes || 0,
          hourlyRate: session.hourlyRate?.toString(),
          bigBlindsWon: session.bigBlindsWon,
          notes: session.notes,
          transactions: session.transactions.map((t) => ({
            id: t.id.value,
            type: t.type,
            amount: t.amount.toString(),
            timestamp: t.timestamp.toISOString(),
            description: t.description,
            notes: t.notes,
          })),
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        },
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

  async cancelSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        res.status(400).json({
          error: "Session ID is required",
        });
        return;
      }

      const sessionId = new SessionId(id);
      await this.sessionService.cancelSession(sessionId, reason);

      res.json({
        success: true,
        message: "Session cancelled successfully",
      });
    } catch (error) {
      logger.error("Error cancelling session", {
        error,
        params: req.params,
        body: req.body,
      });
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

      if (typeof notes !== "string") {
        res.status(400).json({
          error: "Notes must be a string",
        });
        return;
      }

      const sessionId = new SessionId(id);
      await this.sessionService.updateSessionNotes(sessionId, notes);

      res.json({
        success: true,
        message: "Session notes updated successfully",
      });
    } catch (error) {
      logger.error("Error updating session notes", {
        error,
        params: req.params,
        body: req.body,
      });
      res.status(500).json({
        error: "Failed to update session notes",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
