// Player application service - Orchestrates use cases

import { injectable, inject } from "tsyringe";
import { UnitOfWork } from "@/model/repositories";
import {
  AddBankrollUseCase,
  CreatePlayerUseCase,
  GetPlayerUseCase,
  GetPlayerByEmailUseCase,
  ListPlayersUseCase,
  UpdatePlayerUseCase,
} from "../use-cases/players";
import {
  AddBankrollRequest,
  AddBankrollResponse,
  CreatePlayerRequest,
  CreatePlayerResponse,
  GetPlayerResponse,
  ListPlayersResponse,
  UpdatePlayerRequest,
  UpdatePlayerResponse,
} from "../dto/player-dto";

@injectable()
export class PlayerService {
  private createPlayerUseCase: CreatePlayerUseCase;
  private updatePlayerUseCase: UpdatePlayerUseCase;
  private getPlayerUseCase: GetPlayerUseCase;
  private getPlayerByEmailUseCase: GetPlayerByEmailUseCase;
  private listPlayersUseCase: ListPlayersUseCase;
  private addBankrollUseCase: AddBankrollUseCase;

  constructor(@inject("UnitOfWork") unitOfWork: UnitOfWork) {
    this.createPlayerUseCase = new CreatePlayerUseCase(unitOfWork);
    this.updatePlayerUseCase = new UpdatePlayerUseCase(unitOfWork);
    this.getPlayerUseCase = new GetPlayerUseCase(unitOfWork);
    this.getPlayerByEmailUseCase = new GetPlayerByEmailUseCase(unitOfWork);
    this.listPlayersUseCase = new ListPlayersUseCase(unitOfWork);
    this.addBankrollUseCase = new AddBankrollUseCase(unitOfWork);
  }

  async createPlayer(
    request: CreatePlayerRequest
  ): Promise<CreatePlayerResponse> {
    return await this.createPlayerUseCase.execute(request);
  }

  async updatePlayer(
    request: UpdatePlayerRequest
  ): Promise<UpdatePlayerResponse> {
    return await this.updatePlayerUseCase.execute(request);
  }

  async getPlayer(playerId: string): Promise<GetPlayerResponse> {
    return await this.getPlayerUseCase.execute(playerId);
  }

  async getAllPlayers(
    page: number = 1,
    limit: number = 10
  ): Promise<ListPlayersResponse> {
    return await this.listPlayersUseCase.execute(page, limit);
  }

  async addToBankroll(
    request: AddBankrollRequest
  ): Promise<AddBankrollResponse> {
    return await this.addBankrollUseCase.execute(request);
  }

  async getPlayerByEmail(email: string): Promise<GetPlayerResponse> {
    return await this.getPlayerByEmailUseCase.execute(email);
  }
}
