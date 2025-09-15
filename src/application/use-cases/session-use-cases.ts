// Session use cases - Business logic for session operations

import { Session, SessionId, PlayerId } from "@/model/entities";
import { UnitOfWork } from "@/model/repositories";
import { Money, Stakes } from "@/model/value-objects";
import { TransactionType, SessionStatus } from "@/model/enums";
import { logger } from "@/shared/utils/logger";
import { DomainEvents, DomainEventDispatcher } from "@/model/events";
import {
  StartSessionRequest,
  StartSessionResponse,
  EndSessionRequest,
  EndSessionResponse,
  AddTransactionRequest,
  AddTransactionResponse,
  GetSessionResponse,
  ListSessionsRequest,
  ListSessionsResponse,
} from "../dto/session-dto";

export class StartSessionUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(request: StartSessionRequest): Promise<StartSessionResponse> {
    try {
      await this.unitOfWork.begin();

      const playerId = new PlayerId(request.playerId);

      // Check if player has an active session
      const activeSession = await this.unitOfWork.sessions.findActiveByPlayerId(
        playerId
      );
      if (activeSession) {
        throw new Error("Player already has an active session");
      }

      const stakes = new Stakes(
        new Money(request.stakes.smallBlind, request.stakes.currency),
        new Money(request.stakes.bigBlind, request.stakes.currency)
      );
      const initialBuyIn = new Money(
        request.initialBuyIn.amount,
        request.initialBuyIn.currency
      );

      const session = Session.start(
        playerId,
        request.location,
        stakes,
        initialBuyIn,
        request.notes
      );

      await this.unitOfWork.sessions.save(session);
      await this.unitOfWork.commit();

      // Publish collected domain events after successful commit
      const events = DomainEvents.getEvents();
      if (events.length > 0) {
        await DomainEventDispatcher.publishAll(events);
        DomainEvents.clear();
      }

      logger.info("Session started successfully", {
        sessionId: session.id.value,
        playerId: playerId.value,
        location: request.location,
        stakes: stakes.formatted,
      });

      return {
        sessionId: session.id.value,
        playerId: playerId.value,
        location: request.location,
        stakes: {
          smallBlind: stakes.smallBlind.amount,
          bigBlind: stakes.bigBlind.amount,
          currency: stakes.smallBlind.currency,
        },
        initialBuyIn: {
          amount: initialBuyIn.amount,
          currency: initialBuyIn.currency,
        },
        notes: request.notes || undefined,
        status: session.status,
        startedAt: session.startTime,
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error starting session", { error, request });
      throw error;
    }
  }
}

export class EndSessionUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(request: EndSessionRequest): Promise<EndSessionResponse> {
    try {
      await this.unitOfWork.begin();

      const sessionId = new SessionId(request.sessionId);
      const session = await this.unitOfWork.sessions.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (session.status !== SessionStatus.ACTIVE) {
        throw new Error("Session is not active");
      }

      const finalCashOut = new Money(
        request.finalCashOut.amount,
        request.finalCashOut.currency
      );

      session.end(finalCashOut, request.notes);

      await this.unitOfWork.sessions.save(session);
      await this.unitOfWork.commit();

      // Publish collected domain events after successful commit
      const events = DomainEvents.getEvents();
      if (events.length > 0) {
        await DomainEventDispatcher.publishAll(events);
        DomainEvents.clear();
      }

      const duration = session.endTime
        ? Math.floor(
            (session.endTime.getTime() - session.startTime.getTime()) /
              (1000 * 60)
          )
        : 0;

      logger.info("Session ended successfully", {
        sessionId: session.id.value,
        playerId: session.playerId.value,
        profitLoss: session.netResult.amount,
        duration,
      });

      return {
        sessionId: session.id.value,
        playerId: session.playerId.value,
        finalCashOut: {
          amount: finalCashOut.amount,
          currency: finalCashOut.currency,
        },
        profitLoss: {
          amount: session.netResult.amount,
          currency: session.netResult.currency,
        },
        duration,
        status: session.status,
        endedAt: session.endTime!,
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error ending session", { error, request });
      throw error;
    }
  }
}

export class AddTransactionUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(
    request: AddTransactionRequest
  ): Promise<AddTransactionResponse> {
    try {
      await this.unitOfWork.begin();

      const sessionId = new SessionId(request.sessionId);
      const session = await this.unitOfWork.sessions.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (session.status !== SessionStatus.ACTIVE) {
        throw new Error("Session is not active");
      }

      const amount = new Money(request.amount.amount, request.amount.currency);
      const transactionType = request.type as TransactionType;

      session.addTransaction(transactionType, amount, request.description);

      await this.unitOfWork.sessions.save(session);
      await this.unitOfWork.commit();

      // Publish collected domain events after successful commit
      const events = DomainEvents.getEvents();
      if (events.length > 0) {
        await DomainEventDispatcher.publishAll(events);
        DomainEvents.clear();
      }

      logger.info("Transaction added successfully", {
        sessionId: session.id.value,
        type: request.type,
        amount: amount.amount,
      });

      const lastTransaction =
        session.transactions[session.transactions.length - 1];
      return {
        transactionId: lastTransaction?.id.value || "",
        sessionId: session.id.value,
        type: request.type,
        amount: {
          amount: amount.amount,
          currency: amount.currency,
        },
        description: request.description || undefined,
        addedAt: new Date(),
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error adding transaction", { error, request });
      throw error;
    }
  }
}

export class GetSessionUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(sessionId: string): Promise<GetSessionResponse> {
    const id = new SessionId(sessionId);
    const session = await this.unitOfWork.sessions.findById(id);
    if (!session) {
      throw new Error("Session not found");
    }

    const duration = session.endTime
      ? Math.floor(
          (session.endTime.getTime() - session.startTime.getTime()) /
            (1000 * 60)
        )
      : undefined;

    return {
      sessionId: session.id.value,
      playerId: session.playerId.value,
      location: session.location,
      stakes: {
        smallBlind: session.stakes.smallBlind.amount,
        bigBlind: session.stakes.bigBlind.amount,
        currency: session.stakes.smallBlind.currency,
      },
      initialBuyIn: {
        amount: session.totalBuyIn.amount,
        currency: session.totalBuyIn.currency,
      },
      currentCashOut: {
        amount: session.totalCashOut.amount,
        currency: session.totalCashOut.currency,
      },
      profitLoss: {
        amount: session.netResult.amount,
        currency: session.netResult.currency,
      },
      status: session.status,
      notes: session.notes,
      transactions: session.transactions.map((t) => ({
        id: t.id.value,
        type: t.type,
        amount: {
          amount: t.amount.amount,
          currency: t.amount.currency,
        },
        description: t.description || undefined,
        createdAt: t.timestamp,
      })),
      startedAt: session.startTime,
      endedAt: session.endTime,
      duration,
    };
  }
}

export class ListSessionsUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(request: ListSessionsRequest): Promise<ListSessionsResponse> {
    const page = request.page || 1;
    const limit = request.limit || 10;

    // Build filters for repository
    const filters: any = {
      page,
      limit,
    };

    if (request.playerId) {
      filters.playerId = request.playerId;
    }

    if (request.status) {
      filters.status = request.status as SessionStatus;
    }

    if (request.startDate) {
      filters.dateFrom = request.startDate;
    }

    if (request.endDate) {
      filters.dateTo = request.endDate;
    }

    // Use repository's findByFilters method with proper database-level filtering
    const { sessions, total } = await this.unitOfWork.sessions.findByFilters(
      filters
    );

    const sessionResponses = sessions.map((session) => {
      const duration = session.endTime
        ? Math.floor(
            (session.endTime.getTime() - session.startTime.getTime()) /
              (1000 * 60)
          )
        : undefined;

      return {
        sessionId: session.id.value,
        playerId: session.playerId.value,
        location: session.location,
        stakes: {
          smallBlind: session.stakes.smallBlind.amount,
          bigBlind: session.stakes.bigBlind.amount,
          currency: session.stakes.smallBlind.currency,
        },
        initialBuyIn: {
          amount: session.totalBuyIn.amount,
          currency: session.totalBuyIn.currency,
        },
        currentCashOut: {
          amount: session.totalCashOut.amount,
          currency: session.totalCashOut.currency,
        },
        profitLoss: {
          amount: session.netResult.amount,
          currency: session.netResult.currency,
        },
        status: session.status,
        notes: session.notes,
        transactions: session.transactions.map((t) => ({
          id: t.id.value,
          type: t.type,
          amount: {
            amount: t.amount.amount,
            currency: t.amount.currency,
          },
          description: t.description || undefined,
          createdAt: t.timestamp,
        })),
        startedAt: session.startTime,
        endedAt: session.endTime,
        duration,
      };
    });

    return {
      sessions: sessionResponses,
      total,
      page,
      limit,
    };
  }
}
