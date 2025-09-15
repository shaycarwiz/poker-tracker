// Player use cases - Business logic for player operations

import { Player, PlayerId } from "@/model/entities";
import { PlayerRepository, UnitOfWork } from "@/model/repositories";
import { Money } from "@/model/value-objects";
import { logger } from "@/shared/utils/logger";
import {
  CreatePlayerRequest,
  CreatePlayerResponse,
  UpdatePlayerRequest,
  UpdatePlayerResponse,
  GetPlayerResponse,
  ListPlayersResponse,
  AddBankrollRequest,
  AddBankrollResponse,
} from "../dto/player-dto";

export class CreatePlayerUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(request: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    try {
      await this.unitOfWork.begin();

      // Check if player with email already exists
      if (request.email) {
        const existingPlayer = await this.unitOfWork.players.findByEmail(
          request.email
        );
        if (existingPlayer) {
          throw new Error("Player with this email already exists");
        }
      }

      const initialBankroll = request.initialBankroll
        ? new Money(
            request.initialBankroll.amount,
            request.initialBankroll.currency
          )
        : new Money(0, "USD");

      const player = Player.create(
        request.name,
        request.email,
        initialBankroll
      );

      await this.unitOfWork.players.save(player);
      await this.unitOfWork.commit();

      logger.info("Player created successfully", {
        playerId: player.id.value,
        name: player.name,
        email: player.email,
      });

      return {
        id: player.id.value,
        name: player.name,
        email: player.email || undefined,
        bankroll: {
          amount: player.currentBankroll.amount,
          currency: player.currentBankroll.currency,
        },
        createdAt: player.createdAt,
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error creating player", { error, request });
      throw error;
    }
  }
}

export class UpdatePlayerUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(request: UpdatePlayerRequest): Promise<UpdatePlayerResponse> {
    try {
      await this.unitOfWork.begin();

      const playerId = new PlayerId(request.id);
      const player = await this.unitOfWork.players.findById(playerId);
      if (!player) {
        throw new Error("Player not found");
      }

      // Check if email is being changed and if it already exists
      if (request.email && request.email !== player.email) {
        const existingPlayer = await this.unitOfWork.players.findByEmail(
          request.email
        );
        if (existingPlayer) {
          throw new Error("Player with this email already exists");
        }
      }

      if (request.name) {
        player.updateName(request.name);
      }
      if (request.email !== undefined) {
        player.updateEmail(request.email);
      }

      await this.unitOfWork.players.save(player);
      await this.unitOfWork.commit();

      logger.info("Player updated successfully", {
        playerId: player.id.value,
        updates: request,
      });

      return {
        id: player.id.value,
        name: player.name,
        email: player.email || undefined,
        bankroll: {
          amount: player.currentBankroll.amount,
          currency: player.currentBankroll.currency,
        },
        updatedAt: new Date(),
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error updating player", { error, request });
      throw error;
    }
  }
}

export class GetPlayerUseCase {
  constructor(private playerRepository: PlayerRepository) {}

  async execute(playerId: string): Promise<GetPlayerResponse> {
    const id = new PlayerId(playerId);
    const player = await this.playerRepository.findById(id);
    if (!player) {
      throw new Error("Player not found");
    }

    return {
      id: player.id.value,
      name: player.name,
      email: player.email || undefined,
      bankroll: {
        amount: player.currentBankroll.amount,
        currency: player.currentBankroll.currency,
      },
      totalSessions: player.totalSessions,
      totalWinnings: {
        amount: 0, // TODO: Calculate from sessions
        currency: "USD",
      },
      winRate: 0, // TODO: Calculate from sessions
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
  }
}

export class ListPlayersUseCase {
  constructor(private playerRepository: PlayerRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10
  ): Promise<ListPlayersResponse> {
    const players = await this.playerRepository.findAll();
    const total = players.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPlayers = players.slice(startIndex, endIndex);

    const playerResponses = paginatedPlayers.map((player) => ({
      id: player.id.value,
      name: player.name,
      email: player.email || undefined,
      bankroll: {
        amount: player.currentBankroll.amount,
        currency: player.currentBankroll.currency,
      },
      totalSessions: player.totalSessions,
      totalWinnings: {
        amount: 0, // TODO: Calculate from sessions
        currency: "USD",
      },
      winRate: 0, // TODO: Calculate from sessions
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    }));

    return {
      players: playerResponses,
      total,
      page,
      limit,
    };
  }
}

export class AddBankrollUseCase {
  constructor(private unitOfWork: UnitOfWork) {}

  async execute(request: AddBankrollRequest): Promise<AddBankrollResponse> {
    try {
      await this.unitOfWork.begin();

      const playerId = new PlayerId(request.playerId);
      const player = await this.unitOfWork.players.findById(playerId);
      if (!player) {
        throw new Error("Player not found");
      }

      const amount = new Money(request.amount.amount, request.amount.currency);
      player.adjustBankroll(amount);

      await this.unitOfWork.players.save(player);
      await this.unitOfWork.commit();

      logger.info("Bankroll added successfully", {
        playerId: player.id.value,
        addedAmount: amount.amount,
        newBankroll: player.currentBankroll.amount,
      });

      return {
        playerId: player.id.value,
        newBankroll: {
          amount: player.currentBankroll.amount,
          currency: player.currentBankroll.currency,
        },
        addedAmount: {
          amount: amount.amount,
          currency: amount.currency,
        },
        addedAt: new Date(),
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error("Error adding bankroll", { error, request });
      throw error;
    }
  }
}
