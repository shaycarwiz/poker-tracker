// Session application service - Demonstrates data access layer usage

import { Session, SessionId, PlayerId } from "@/model/entities";
import { UnitOfWork } from "@/model/repositories";
import { Money, Stakes } from "@/model/value-objects";
import { TransactionType, SessionStatus } from "@/model/enums";
import { logger } from "@/shared/utils/logger";

export class SessionService {
  constructor(private unitOfWork: UnitOfWork) {}

  async startSession(
    playerId: PlayerId,
    location: string,
    stakes: Stakes,
    initialBuyIn: Money,
    notes?: string
  ): Promise<Session> {
    try {
      await this.unitOfWork.begin();

      // Check if player has an active session
      const activeSession = await this.unitOfWork.sessions.findActiveByPlayerId(
        playerId
      );
      if (activeSession) {
        throw new Error("Player already has an active session");
      }

      const session = Session.start(
        playerId,
        location,
        stakes,
        initialBuyIn,
        notes
      );
      await this.unitOfWork.sessions.save(session);

      await this.unitOfWork.commit();
      logger.info("Session started successfully", {
        sessionId: session.id.value,
        playerId: playerId.value,
        location,
        stakes: stakes.formatted,
      });
      return session;
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error starting session", {
        playerId: playerId.value,
        error,
      });
      throw error;
    }
  }

  async endSession(
    sessionId: SessionId,
    finalCashOut: Money,
    notes?: string
  ): Promise<void> {
    try {
      await this.unitOfWork.begin();

      const session = await this.unitOfWork.sessions.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (session.status !== SessionStatus.ACTIVE) {
        throw new Error("Session is not active");
      }

      session.end(finalCashOut, notes);
      await this.unitOfWork.sessions.save(session);

      // Update player's session count and bankroll
      const player = await this.unitOfWork.players.findById(session.playerId);
      if (player) {
        player.incrementSessionCount();
        player.adjustBankroll(session.netResult);
        await this.unitOfWork.players.save(player);
      }

      await this.unitOfWork.commit();
      logger.info("Session ended successfully", {
        sessionId: sessionId.value,
        netResult: session.netResult.toString(),
      });
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error ending session", {
        sessionId: sessionId.value,
        error,
      });
      throw error;
    }
  }

  async addTransaction(
    sessionId: SessionId,
    type: TransactionType,
    amount: Money,
    description?: string,
    notes?: string
  ): Promise<void> {
    try {
      await this.unitOfWork.begin();

      const session = await this.unitOfWork.sessions.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (session.status !== SessionStatus.ACTIVE) {
        throw new Error("Cannot add transactions to inactive session");
      }

      session.addTransaction(type, amount, description, notes);
      await this.unitOfWork.sessions.save(session);

      await this.unitOfWork.commit();
      logger.info("Transaction added successfully", {
        sessionId: sessionId.value,
        type,
        amount: amount.toString(),
      });
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error adding transaction", {
        sessionId: sessionId.value,
        error,
      });
      throw error;
    }
  }

  async getSessionById(sessionId: SessionId): Promise<Session | null> {
    try {
      return await this.unitOfWork.sessions.findById(sessionId);
    } catch (error) {
      logger.error("Error getting session by ID", {
        sessionId: sessionId.value,
        error,
      });
      throw new Error("Failed to get session");
    }
  }

  async getPlayerSessions(playerId: PlayerId): Promise<Session[]> {
    try {
      return await this.unitOfWork.sessions.findByPlayerId(playerId);
    } catch (error) {
      logger.error("Error getting player sessions", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to get player sessions");
    }
  }

  async getActiveSession(playerId: PlayerId): Promise<Session | null> {
    try {
      return await this.unitOfWork.sessions.findActiveByPlayerId(playerId);
    } catch (error) {
      logger.error("Error getting active session", {
        playerId: playerId.value,
        error,
      });
      throw new Error("Failed to get active session");
    }
  }

  async cancelSession(sessionId: SessionId, reason?: string): Promise<void> {
    try {
      await this.unitOfWork.begin();

      const session = await this.unitOfWork.sessions.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (session.status !== SessionStatus.ACTIVE) {
        throw new Error("Session is not active");
      }

      session.cancel(reason);
      await this.unitOfWork.sessions.save(session);

      await this.unitOfWork.commit();
      logger.info("Session cancelled successfully", {
        sessionId: sessionId.value,
        reason,
      });
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error cancelling session", {
        sessionId: sessionId.value,
        error,
      });
      throw error;
    }
  }

  async updateSessionNotes(sessionId: SessionId, notes: string): Promise<void> {
    try {
      await this.unitOfWork.begin();

      const session = await this.unitOfWork.sessions.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      session.updateNotes(notes);
      await this.unitOfWork.sessions.save(session);

      await this.unitOfWork.commit();
      logger.info("Session notes updated successfully", {
        sessionId: sessionId.value,
      });
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error updating session notes", {
        sessionId: sessionId.value,
        error,
      });
      throw error;
    }
  }
}
