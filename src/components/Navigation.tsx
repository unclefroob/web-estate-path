import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navigation.css";

export function Navigation() {
  const { user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          Estate Path
        </Link>

        <button
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? "open" : ""}`}></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link to="/search" className="nav-link" onClick={closeMenu}>
            Search Addresses
          </Link>

          {user ? (
            <>
              <Link to="/properties" className="nav-link" onClick={closeMenu}>
                My Properties
              </Link>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
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
            <Link to="/auth" className="nav-button-link" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
