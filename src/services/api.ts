const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Storage keys for auth data (must match AuthContext)
const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
};

/**
 * Handles 401 Unauthorized responses by:
 * 1. Clearing all authentication data from localStorage
 * 2. Redirecting to the login page
 */
function handle401Error(): void {
  // Clear all auth-related data from localStorage
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);

  // Store current location for redirect after login
  const currentPath = window.location.pathname;
  if (currentPath !== "/auth" && currentPath !== "/") {
    localStorage.setItem("redirectAfterLogin", currentPath);
  }

  // Redirect to login page
  window.location.href = "/auth";
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    // Handle 401 Unauthorized - user's session is invalid
    if (response.status === 401) {
      handle401Error();
    }

    throw new ApiError(response.status, data.message || "An error occurred");
  }

  return data;
}

export const api = {
  async post<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers,
    });

    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse<T>(response);
  },
};
