import {
  Hand,
  PlayerId,
  SessionId,
  UserId,
} from "@/model/entities";
import { SessionStatus } from "@/model/enums";
import { CaptureType } from "@/model/hand-state";
import { logger } from "@/shared/utils/logger";
import {
  CreateHandRequest,
  CreateHandResponse,
} from "../../dto/hand-dto";
import { BaseUseCase } from "../base-use-case";
import { mapHandToResponse } from "./hand-mappers";

export class CreateHandUseCase extends BaseUseCase {
  async execute(request: CreateHandRequest): Promise<CreateHandResponse> {
    return this.executeWithTransaction(async () => {
      const sessionId = new SessionId(request.sessionId);
      const userId = new UserId(request.userId);

      const session = await this.unitOfWork.sessions.findById(sessionId);

      if (!session || !session.isOwnedBy(userId)) {
        throw new Error("Session not found");
      }

      if (
        session.status !== SessionStatus.ACTIVE &&
        session.status !== SessionStatus.COMPLETED
      ) {
        throw new Error("Cannot add hands to this session");
      }

      const heroPlayerId = request.heroPlayerId
        ? new PlayerId(request.heroPlayerId)
        : undefined;

      if (heroPlayerId) {
        const player = await this.unitOfWork.players.findById(heroPlayerId);
        if (!player || !player.isOwnedBy(userId)) {
          throw new Error("Player not found");
        }
      }

      const hand = Hand.create(
        sessionId,
        userId,
        request.captureType as CaptureType,
        request.handState,
        session.stakes.bigBlind.currency,
        heroPlayerId,
        request.tags,
        request.note
      );

      await this.unitOfWork.hands.save(hand);

      logger.info("Hand created successfully", {
        handId: hand.id.value,
        sessionId: session.id.value,
        captureType: request.captureType,
      });

      return mapHandToResponse(hand);
    }, "CreateHandUseCase", { request });
  }
}
