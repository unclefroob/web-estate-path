import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnSwitchToSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with all fields", () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
      />
    );

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });
  });

  it("displays error message from props", () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
        error="Invalid credentials"
      />
    );

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("disables form when loading", () => {
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
        isLoading={true}
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeDisabled();
  });

  it("calls onSwitchToSignup when sign up button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        onSwitchToSignup={mockOnSwitchToSignup}
      />
    );

    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(signUpButton);

    expect(mockOnSwitchToSignup).toHaveBeenCalledTimes(1);
  });
});
