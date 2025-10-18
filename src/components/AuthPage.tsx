import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

type AuthMode = "login" | "signup";

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const { user, login, register, isLoading, error } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = localStorage.getItem("redirectAfterLogin");
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectTo || "/search", { replace: true });
    }
  }, [user, navigate]);

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
