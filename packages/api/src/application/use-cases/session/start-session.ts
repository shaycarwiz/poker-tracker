import { PlayerId, Session, UserId } from "@/model/entities";
import { Money, Stakes } from "@/model/value-objects";
import { logger } from "@/shared/utils/logger";
import {
  StartSessionRequest,
  StartSessionResponse,
} from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";
import { BusinessError, API_ERROR_CODES } from "../../../shared";

export class StartSessionUseCase extends BaseUseCase {
  async execute(request: StartSessionRequest): Promise<StartSessionResponse> {
    return this.executeWithTransactionAndEvents(
      async () => {
        const userId = new UserId(request.userId);
        const user = await this.unitOfWork.users.findById(userId);

        if (!user || !user.defaultPlayerId) {
          throw new Error("User not found");
        }

        const buyInPlayerId = new PlayerId(
          request.initialBuyInPlayerId || user.defaultPlayerId.value
        );
        const buyInPlayer = await this.unitOfWork.players.findById(
          buyInPlayerId
        );

        if (!buyInPlayer || !buyInPlayer.isOwnedBy(userId)) {
          throw new Error("Player not found");
        }

        const activeSession =
          await this.unitOfWork.sessions.findActiveByUserId(userId);

        if (activeSession) {
          throw new BusinessError(
            API_ERROR_CODES.BUSINESS_ACTIVE_SESSION_EXISTS
          );
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
          userId,
          request.location,
          stakes,
          initialBuyIn,
          buyInPlayerId,
          request.notes
        );

        await this.unitOfWork.sessions.save(session);

        logger.info("Session started successfully", {
          sessionId: session.id.value,
          userId: userId.value,
          location: request.location,
        });

        return {
          result: {
            sessionId: session.id.value,
            userId: userId.value,
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
      { request }
    );
  }
}
