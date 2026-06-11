import { injectable, inject } from "tsyringe";
import { UnitOfWork } from "@/model/repositories";
import {
  CreateHandUseCase,
  DeleteHandUseCase,
  GetHandUseCase,
  ListHandsBySessionUseCase,
  UpdateHandUseCase,
} from "../use-cases/hand";
import {
  CreateHandRequest,
  CreateHandResponse,
  HandResponse,
  ListHandsResponse,
  UpdateHandRequest,
  UpdateHandResponse,
} from "../dto/hand-dto";

@injectable()
export class HandService {
  private createHandUseCase: CreateHandUseCase;
  private updateHandUseCase: UpdateHandUseCase;
  private getHandUseCase: GetHandUseCase;
  private listHandsBySessionUseCase: ListHandsBySessionUseCase;
  private deleteHandUseCase: DeleteHandUseCase;

  constructor(@inject("UnitOfWork") unitOfWork: UnitOfWork) {
    this.createHandUseCase = new CreateHandUseCase(unitOfWork);
    this.updateHandUseCase = new UpdateHandUseCase(unitOfWork);
    this.getHandUseCase = new GetHandUseCase(unitOfWork);
    this.listHandsBySessionUseCase = new ListHandsBySessionUseCase(unitOfWork);
    this.deleteHandUseCase = new DeleteHandUseCase(unitOfWork);
  }

  async createHand(request: CreateHandRequest): Promise<CreateHandResponse> {
    return this.createHandUseCase.execute(request);
  }

  async updateHand(request: UpdateHandRequest): Promise<UpdateHandResponse> {
    return this.updateHandUseCase.execute(request);
  }

  async getHand(handId: string, userId: string): Promise<HandResponse> {
    return this.getHandUseCase.execute(handId, userId);
  }

  async listHandsBySession(
    sessionId: string,
    userId: string
  ): Promise<ListHandsResponse> {
    return this.listHandsBySessionUseCase.execute(sessionId, userId);
  }

  async deleteHand(handId: string, userId: string): Promise<void> {
    return this.deleteHandUseCase.execute(handId, userId);
  }
}
