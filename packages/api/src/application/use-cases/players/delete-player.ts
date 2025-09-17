// Delete Player Use Case

import { PlayerId } from "@/model/entities";
import { SessionStatus } from "@/model/enums";
import { logger } from "@/shared/utils/logger";
import { BaseUseCase } from "../base-use-case";

export class DeletePlayerUseCase extends BaseUseCase {
  async execute(playerId: string): Promise<void> {
    return this.executeWithTransaction(
      async () => {
        const id = new PlayerId(playerId);
        const player = await this.unitOfWork.players.findById(id);

        if (!player) {
          throw new Error("Player not found");
        }

        // Check if player has any active sessions
        const sessions = await this.unitOfWork.sessions.findByPlayerId(id);
        const hasActiveSessions = sessions.some(
          (session) => session.status === SessionStatus.ACTIVE,
        );

        if (hasActiveSessions) {
          throw new Error("Cannot delete player with active sessions");
        }

        await this.unitOfWork.players.delete(id);

        logger.info("Player deleted successfully", {
          playerId: player.id.value,
          name: player.name,
        });
      },
      "DeletePlayerUseCase",
      { playerId },
    );
  }
}
