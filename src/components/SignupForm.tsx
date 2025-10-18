import React, { useState } from "react";

interface SignupFormProps {
  onSubmit: (email: string, password: string, name: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SignupForm({
  onSubmit,
  onSwitchToLogin,
  isLoading,
  error,
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !password || !confirmPassword || !name) {
      setValidationError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (name.trim().length < 2) {
      setValidationError("Name must be at least 2 characters long");
      return;
    }

    try {
      await onSubmit(email, password, name);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  return (
    <div className="signup-form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={isLoading}
            autoComplete="name"
          />
        </div>

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
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        {(validationError || error) && (
          <div className="error-message" role="alert">
            {validationError || error}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="switch-form">
        <p>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="link-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
