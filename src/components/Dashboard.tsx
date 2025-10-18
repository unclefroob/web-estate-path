import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Estate Path Dashboard</h1>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="logout-button"
          >
            {isLoading ? "Logging out..." : "Logout"}
          </button>
        </header>

        <div className="dashboard-content">
          <div className="user-info">
            <h2>Welcome, {user?.name}!</h2>
            <div className="user-details">
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Role:</strong> {user?.role}
              </p>
              <p>
                <strong>User ID:</strong> {user?.id}
              </p>
            </div>
          </div>

          <div className="dashboard-message">
            <p>You have successfully logged in to Estate Path.</p>
            <p>This is a protected route that requires authentication.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
