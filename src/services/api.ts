const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
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
};
