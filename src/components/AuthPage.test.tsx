import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthPage } from "./AuthPage";
import { AuthProvider } from "../context/AuthContext";

// Mock the auth service
vi.mock("../services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe("AuthPage", () => {
  const renderAuthPage = () => {
    return render(
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    );
  };

  it("renders login form by default", () => {
    renderAuthPage();

    expect(
      screen.getByRole("heading", { name: /estate path/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("switches to signup form when sign up button is clicked", async () => {
    const user = userEvent.setup();
    renderAuthPage();

    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(signUpButton);

    expect(
      screen.getByRole("heading", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("switches back to login form when login button is clicked", async () => {
    const user = userEvent.setup();
    renderAuthPage();

    // Switch to signup
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(signUpButton);

    // Switch back to login
    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/confirm password/i)
    ).not.toBeInTheDocument();
  });

  it("displays welcome message", () => {
    renderAuthPage();

    expect(
      screen.getByText(/welcome back! please login to your account/i)
    ).toBeInTheDocument();
  });
});
