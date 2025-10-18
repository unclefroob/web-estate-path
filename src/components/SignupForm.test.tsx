import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./SignupForm";

describe("SignupForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form with all fields", () => {
    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();

    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await user.type(screen.getByLabelText(/^name$/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates password length", async () => {
    const user = userEvent.setup();

    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await user.type(screen.getByLabelText(/^name$/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "12345");
    await user.type(screen.getByLabelText(/confirm password/i), "12345");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/password must be at least 6 characters long/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates password match", async () => {
    const user = userEvent.setup();

    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await user.type(screen.getByLabelText(/^name$/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different123");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates name length", async () => {
    const user = userEvent.setup();

    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await user.type(screen.getByLabelText(/^name$/i), "J");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    expect(
      screen.getByText(/name must be at least 2 characters long/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    await user.type(screen.getByLabelText(/^name$/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "John Doe"
      );
    });
  });

  it("displays error message from props", () => {
    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
        error="User already exists"
      />
    );

    expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
  });

  it("disables form when loading", () => {
    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
        isLoading={true}
      />
    );

    expect(screen.getByLabelText(/^name$/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /creating account/i })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /login/i })).toBeDisabled();
  });

  it("calls onSwitchToLogin when login button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <SignupForm
        onSubmit={mockOnSubmit}
        onSwitchToLogin={mockOnSwitchToLogin}
      />
    );

    const loginButton = screen.getByRole("button", { name: /login/i });
    await user.click(loginButton);

    expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
  });
});
