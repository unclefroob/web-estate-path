import React, { useState } from "react";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({
  onSubmit,
  onSwitchToSignup,
  isLoading,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password) {
      setValidationError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  return (
    <div className="login-form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        {(validationError || error) && (
          <div className="error-message" role="alert">
            {validationError || error}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="switch-form">
        <p>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            disabled={isLoading}
            className="link-button"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
