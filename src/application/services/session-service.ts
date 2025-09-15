// Session application service - Orchestrates use cases

import { UnitOfWork } from "@/model/repositories";
import {
  StartSessionUseCase,
  EndSessionUseCase,
  AddTransactionUseCase,
  GetSessionUseCase,
  ListSessionsUseCase,
} from "../use-cases/session-use-cases";
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

export class SessionService {
  private startSessionUseCase: StartSessionUseCase;
  private endSessionUseCase: EndSessionUseCase;
  private addTransactionUseCase: AddTransactionUseCase;
  private getSessionUseCase: GetSessionUseCase;
  private listSessionsUseCase: ListSessionsUseCase;

  constructor(unitOfWork: UnitOfWork) {
    this.startSessionUseCase = new StartSessionUseCase(unitOfWork);
    this.endSessionUseCase = new EndSessionUseCase(unitOfWork);
    this.addTransactionUseCase = new AddTransactionUseCase(unitOfWork);
    this.getSessionUseCase = new GetSessionUseCase(unitOfWork);
    this.listSessionsUseCase = new ListSessionsUseCase(unitOfWork);
  }

  async startSession(
    request: StartSessionRequest
  ): Promise<StartSessionResponse> {
    return await this.startSessionUseCase.execute(request);
  }

  async endSession(request: EndSessionRequest): Promise<EndSessionResponse> {
    return await this.endSessionUseCase.execute(request);
  }

  async addTransaction(
    request: AddTransactionRequest
  ): Promise<AddTransactionResponse> {
    return await this.addTransactionUseCase.execute(request);
  }

  async getSession(sessionId: string): Promise<GetSessionResponse> {
    return await this.getSessionUseCase.execute(sessionId);
  }

  async listSessions(
    request: ListSessionsRequest
  ): Promise<ListSessionsResponse> {
    return await this.listSessionsUseCase.execute(request);
  }
}
