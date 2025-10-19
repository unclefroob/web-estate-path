import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { propertyService } from "../services/propertyService";
import type { Property } from "../types/property";
import {
  formatAustralianAddress,
  abbreviateStreetType,
} from "../utils/addressFormatter";
import "./SavedProperties.css";

export function SavedProperties() {
  const { user, accessToken } = useAuth();
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();

    // Check if we were redirected here after a successful action
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear the state so the message doesn't reappear on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchProperties = async () => {
    if (!accessToken) {
      setError("Please log in to view your saved properties");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await propertyService.getUserProperties(accessToken);

      if (response.success && response.data?.properties) {
        setProperties(response.data.properties);
      } else {
        setError(response.message || "Failed to load properties");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load properties";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!accessToken) {
      setError("Please log in to delete properties");
      return;
    }

    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      setDeletingId(propertyId);
      setError(null);
      const response = await propertyService.deleteProperty(
        propertyId,
        accessToken
      );

      if (response.success) {
        setProperties(properties.filter((p) => p._id !== propertyId));
      } else {
        setError(response.message || "Failed to delete property");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete property";
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="saved-properties-container">
        <div className="not-logged-in">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your saved properties.</p>
          <a href="/auth" className="login-link">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-properties-container">
      <div className="saved-properties-header">
        <h1>My Saved Properties</h1>
        <p className="property-count">
          {properties.length}{" "}
          {properties.length === 1 ? "property" : "properties"} saved
        </p>
      </div>

      {successMessage && (
        <div className="success-message" role="status">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <h2>No Properties Saved Yet</h2>
          <p>
            Start by searching for an address and saving properties you're
            interested in.
          </p>
          <a href="/search" className="search-link">
            Search for Properties
          </a>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property._id} className="property-card">
              <Link
                to={`/properties/${property._id}`}
                className="property-card-link"
              >
                <div className="property-header">
                  <h3>{formatAustralianAddress(property)}</h3>
                </div>

                <div className="property-details">
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">
                      {property.unit && `${property.unit}/`}
                      {property.number} {abbreviateStreetType(property.street)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Suburb:</span>
                    <span className="detail-value">{property.suburb}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">State:</span>
                    <span className="detail-value">{property.state}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Postcode:</span>
                    <span className="detail-value">{property.postcode}</span>
                  </div>

                  {property.coordinates && (
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">
                        {property.coordinates.lat}, {property.coordinates.lon}
                      </span>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="detail-label">Saved:</span>
                    <span className="detail-value">
                      {new Date(property.createdAt).toLocaleDateString(
                        "en-AU",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="property-actions">
                <button
                  onClick={() => handleDelete(property._id)}
                  disabled={deletingId === property._id}
                  className="delete-button"
                  aria-label="Delete property"
                >
                  {deletingId === property._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
