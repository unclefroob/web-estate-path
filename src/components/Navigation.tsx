import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navigation.css";

export function Navigation() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Estate Path
        </Link>

        <div className="nav-links">
          <Link to="/search" className="nav-link">
            Search Addresses
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="nav-button"
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-button-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
