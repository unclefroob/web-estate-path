import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import type { User, AuthContextType } from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tokens and user from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const saveAuthData = (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => {
    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const clearAuthData = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login({ email, password });

      if (
        response.success &&
        response.data?.user &&
        response.data.accessToken &&
        response.data.refreshToken
      ) {
        saveAuthData(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register({ email, password, name });

      if (
        response.success &&
        response.data?.user &&
        response.data.accessToken &&
        response.data.refreshToken
      ) {
        saveAuthData(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (refreshToken && accessToken) {
        await authService.logout(refreshToken, accessToken);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
    } finally {
      clearAuthData();
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
