import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AuthContext } from "./context/AuthContext";
import type { AuthContextType } from "./types/auth";

// Mock the auth service
vi.mock("./services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getProfile: vi.fn(),
  },
}));

// Mock the address service
vi.mock("./services/addressService", () => ({
  addressService: {
    searchAddresses: vi.fn(),
  },
}));

// Mock the property service
vi.mock("./services/propertyService", () => ({
  propertyService: {
    getUserProperties: vi.fn(),
    createProperty: vi.fn(),
    getPropertyById: vi.fn(),
    deleteProperty: vi.fn(),
  },
}));

describe("App", () => {
  const mockAuthContext: AuthContextType = {
    user: null,
    accessToken: null,
    refreshToken: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    error: null,
  };

  const renderApp = (
    contextOverrides?: Partial<AuthContextType>,
    initialRoute = "/"
  ) => {
    const context = { ...mockAuthContext, ...contextOverrides };
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthContext.Provider value={context}>
          <App />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it("renders navigation", () => {
    renderApp();
    expect(screen.getByText(/estate path/i)).toBeInTheDocument();
  });

  it("redirects to search page by default", () => {
    renderApp();
    expect(
      screen.getByRole("heading", { name: /find your australian address/i })
    ).toBeInTheDocument();
  });

  it("shows address search page on /search route", () => {
    renderApp(undefined, "/search");
    expect(
      screen.getByRole("heading", { name: /find your australian address/i })
    ).toBeInTheDocument();
  });

  it("shows auth page on /auth route", () => {
    renderApp({ user: null }, "/auth");
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  });

  it("shows loading spinner when accessing protected route while loading", () => {
    renderApp({ isLoading: true }, "/dashboard");
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("redirects to auth page when accessing protected route without login", () => {
    renderApp({ user: null }, "/dashboard");
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  });

  it("shows dashboard when user is logged in and accesses /dashboard", () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      name: "John Doe",
      role: "user",
    };

    renderApp(
      {
        user: mockUser,
        accessToken: "mock-token",
        refreshToken: "mock-refresh-token",
      },
      "/dashboard"
    );

    expect(
      screen.getByRole("heading", { name: /estate path dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
  });

  it("redirects to auth page when accessing /properties without login", () => {
    renderApp({ user: null }, "/properties");
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  });

  it("shows loading spinner when accessing /properties while loading", () => {
    renderApp({ isLoading: true }, "/properties");
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
