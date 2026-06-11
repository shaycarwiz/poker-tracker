import { injectable, inject } from "tsyringe";
import { UnitOfWork } from "@/model/repositories";
import {
  GetUserProfileUseCase,
  GetUserPreferencesUseCase,
  LoginOrRegisterUseCase,
  UpdateUserPreferencesUseCase,
  UpdateUserProfileUseCase,
} from "../use-cases/users";
import {
  GetUserProfileResponse,
  LoginOrRegisterRequest,
  LoginOrRegisterResponse,
  UpdateUserPreferencesRequest,
  UpdateUserProfileRequest,
  UserPreferencesResponse,
} from "../dto/user-dto";

@injectable()
export class UserService {
  private loginOrRegisterUseCase: LoginOrRegisterUseCase;
  private getUserProfileUseCase: GetUserProfileUseCase;
  private updateUserProfileUseCase: UpdateUserProfileUseCase;
  private getUserPreferencesUseCase: GetUserPreferencesUseCase;
  private updateUserPreferencesUseCase: UpdateUserPreferencesUseCase;

  constructor(@inject("UnitOfWork") unitOfWork: UnitOfWork) {
    this.loginOrRegisterUseCase = new LoginOrRegisterUseCase(unitOfWork);
    this.getUserProfileUseCase = new GetUserProfileUseCase(unitOfWork);
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(unitOfWork);
    this.getUserPreferencesUseCase = new GetUserPreferencesUseCase(unitOfWork);
    this.updateUserPreferencesUseCase = new UpdateUserPreferencesUseCase(
      unitOfWork
    );
  }

  async loginOrRegister(
    request: LoginOrRegisterRequest
  ): Promise<LoginOrRegisterResponse> {
    return await this.loginOrRegisterUseCase.execute(request);
  }

  async getProfile(userId: string): Promise<GetUserProfileResponse> {
    return await this.getUserProfileUseCase.execute(userId);
  }

  async updateProfile(
    userId: string,
    request: UpdateUserProfileRequest
  ): Promise<GetUserProfileResponse> {
    return await this.updateUserProfileUseCase.execute(userId, request);
  }

  async getPreferences(userId: string): Promise<UserPreferencesResponse> {
    return await this.getUserPreferencesUseCase.execute(userId);
  }

  async updatePreferences(
    request: UpdateUserPreferencesRequest
  ): Promise<UserPreferencesResponse> {
    return await this.updateUserPreferencesUseCase.execute(request);
  }
}
