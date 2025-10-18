import { api } from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
} from "../types/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/login", credentials);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/register", data);
  },

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/auth/refresh", data);
  },

  async logout(refreshToken: string, accessToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken }, accessToken);
  },

  async getProfile(accessToken: string): Promise<AuthResponse> {
    return api.get<AuthResponse>("/auth/me", accessToken);
  },
};
