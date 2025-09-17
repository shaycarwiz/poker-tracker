// Start Session Use Case

import { PlayerId, Session } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";
import { logger } from "@/shared/utils/logger";
import {
  StartSessionRequest,
  StartSessionResponse,
} from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";

export class StartSessionUseCase extends BaseUseCase {
  async execute(request: StartSessionRequest): Promise<StartSessionResponse> {
    return this.executeWithTransactionAndEvents(
      async () => {
        const playerId = new PlayerId(request.playerId);

        // Check if player has an active session
        const activeSession =
          await this.unitOfWork.sessions.findActiveByPlayerId(playerId);

        if (activeSession) {
          throw new Error("Player already has an active session");
        }

        const stakes = new Stakes(
          new Money(request.stakes.smallBlind, request.stakes.currency),
          new Money(request.stakes.bigBlind, request.stakes.currency),
        );
        const initialBuyIn = new Money(
          request.initialBuyIn.amount,
          request.initialBuyIn.currency,
        );

        const session = Session.start(
          playerId,
          request.location,
          stakes,
          initialBuyIn,
          request.notes,
        );

        await this.unitOfWork.sessions.save(session);

        logger.info("Session started successfully", {
          sessionId: session.id.value,
          playerId: playerId.value,
          location: request.location,
          stakes: stakes.formatted,
        });

        return {
          result: {
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
          },
          entity: session,
        };
      },
      "StartSessionUseCase",
      { request },
    );
  }
}
