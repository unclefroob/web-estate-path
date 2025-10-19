import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { propertyService } from "../services/propertyService";
import type { Property } from "../types/property";
import { formatAustralianAddress } from "../utils/addressFormatter";
import "./PropertyDetails.css";

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !accessToken) {
      setError("Invalid property or not authenticated");
      setIsLoading(false);
      return;
    }

    fetchProperty();

    // Check if we were redirected here after a successful action
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clear the state so the message doesn't reappear on refresh
      window.history.replaceState({}, document.title);
    }
  }, [id, accessToken, location]);

  const fetchProperty = async () => {
    if (!id || !accessToken) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await propertyService.getPropertyById(id, accessToken);

      if (response.success && response.data?.property) {
        setProperty(response.data.property);
      } else {
        setError(response.message || "Property not found");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load property";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !accessToken || !property) return;

    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      const response = await propertyService.deleteProperty(id, accessToken);

      if (response.success) {
        navigate("/properties", {
          state: { message: "Property deleted successfully" },
        });
      } else {
        setError(response.message || "Failed to delete property");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete property";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const openInMaps = () => {
    if (!property?.coordinates) return;
    const url = `https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lon}`;
    window.open(url, "_blank");
  };

  if (!user) {
    return (
      <div className="property-details-container">
        <div className="not-logged-in">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view property details.</p>
          <Link to="/auth" className="login-link">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="property-details-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-details-container">
        <div className="error-state">
          <h2>Property Not Found</h2>
          <p>{error || "The property you're looking for doesn't exist."}</p>
          <Link to="/properties" className="back-link">
            Back to My Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="property-details-container">
      <div className="property-details-header">
        <Link to="/properties" className="back-button">
          ← Back to Properties
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="delete-button"
        >
          {isDeleting ? "Deleting..." : "Delete Property"}
        </button>
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

      <div className="property-card-detail">
        <div className="property-main-info">
          <h1>{formatAustralianAddress(property)}</h1>
          <p className="property-saved-date">
            Saved on{" "}
            {new Date(property.createdAt).toLocaleDateString("en-AU", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="property-sections">
          <section className="property-section">
            <h2>Address Details</h2>
            <div className="detail-grid">
              {property.unit && (
                <div className="detail-item">
                  <span className="detail-label">Unit</span>
                  <span className="detail-value">{property.unit}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Number</span>
                <span className="detail-value">
                  {property.number.includes("/")
                    ? property.number.split("/").pop() || property.number
                    : property.number}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Street</span>
                <span className="detail-value">{property.street}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Suburb</span>
                <span className="detail-value">{property.suburb}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">State</span>
                <span className="detail-value">{property.state}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Postcode</span>
                <span className="detail-value">{property.postcode}</span>
              </div>
            </div>
          </section>

          {property.coordinates && (
            <section className="property-section">
              <h2>Location</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Latitude</span>
                  <span className="detail-value">
                    {property.coordinates.lat}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Longitude</span>
                  <span className="detail-value">
                    {property.coordinates.lon}
                  </span>
                </div>
              </div>
              <button onClick={openInMaps} className="map-button">
                View on Google Maps
              </button>
            </section>
          )}

          <section className="property-section">
            <h2>Property Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Property ID</span>
                <span className="detail-value property-id">{property._id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created</span>
                <span className="detail-value">
                  {new Date(property.createdAt).toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {property.updatedAt !== property.createdAt && (
                <div className="detail-item">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">
                    {new Date(property.updatedAt).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
