export interface LoginOrRegisterRequest {
  googleId: string;
  email: string;
  name: string;
}

export interface LoginOrRegisterResponse {
  userId: string;
  name: string;
  email: string;
  defaultPlayerId: string;
}

export interface GetUserProfileResponse {
  id: string;
  name: string;
  email: string;
  defaultPlayerId?: string;
  preferredLanguage: string;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
}

export interface UpdateUserPreferencesRequest {
  userId: string;
  preferredLanguage?: string;
  defaultCurrency?: string;
}

export interface UserPreferencesResponse {
  preferredLanguage: string;
  defaultCurrency: string;
}
