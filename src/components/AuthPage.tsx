import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

type AuthMode = "login" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const { login, register, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleSignup = async (
    email: string,
    password: string,
    name: string
  ) => {
    await register(email, password, name);
  };

  const switchToSignup = () => setMode("signup");
  const switchToLogin = () => setMode("login");

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Estate Path</h1>
          <p>Welcome back! Please login to your account.</p>
        </div>

        {mode === "login" ? (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToSignup={switchToSignup}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <SignupForm
            onSubmit={handleSignup}
            onSwitchToLogin={switchToLogin}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
