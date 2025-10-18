import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "./Dashboard";
import { AuthContext } from "../context/AuthContext";
import type { AuthContextType } from "../types/auth";

describe("Dashboard", () => {
  const mockLogout = vi.fn();

  const mockAuthContext: AuthContextType = {
    user: {
      id: "123",
      email: "test@example.com",
      name: "John Doe",
      role: "user",
    },
    accessToken: "mock-token",
    refreshToken: "mock-refresh-token",
    login: vi.fn(),
    register: vi.fn(),
    logout: mockLogout,
    isLoading: false,
    error: null,
  };

  const renderDashboard = (contextOverrides?: Partial<AuthContextType>) => {
    const context = { ...mockAuthContext, ...contextOverrides };
    return render(
      <AuthContext.Provider value={context}>
        <Dashboard />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user information", () => {
    renderDashboard();

    expect(screen.getByText(/welcome, john doe!/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/user/i)).toBeInTheDocument();
    expect(screen.getByText(/123/i)).toBeInTheDocument();
  });

  it("renders dashboard header", () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", { name: /estate path dashboard/i })
    ).toBeInTheDocument();
  });

  it("renders logout button", () => {
    renderDashboard();

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);
    renderDashboard();

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("disables logout button when loading", () => {
    renderDashboard({ isLoading: true });

    const logoutButton = screen.getByRole("button", { name: /logging out/i });
    expect(logoutButton).toBeDisabled();
  });

  it("displays success message", () => {
    renderDashboard();

    expect(
      screen.getByText(/you have successfully logged in to estate path/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /this is a protected route that requires authentication/i
      )
    ).toBeInTheDocument();
  });
});
