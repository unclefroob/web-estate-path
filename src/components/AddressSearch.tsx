import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addressService } from "../services/addressService";
import { propertyService } from "../services/propertyService";
import { useAuth } from "../context/AuthContext";
import type { AddressSuggestion } from "../types/address";
import "./AddressSearch.css";

export function AddressSearch() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await addressService.searchAddresses(searchQuery);

      if (response.success) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      } else {
        setError(response.message || "Failed to fetch addresses");
        setSuggestions([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch addresses"
      );
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedAddress(null);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debouncing
    debounceTimerRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.display_name);
    setSelectedAddress(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setSaveSuccess(false);
  };

  const handleSaveProperty = async () => {
    if (!selectedAddress) {
      setError("Please select an address first");
      return;
    }

    // Extract required fields
    const number = selectedAddress.address.house_number || "";
    const street = selectedAddress.address.road || "";
    const suburb = selectedAddress.address.suburb || "";
    const state = selectedAddress.address.state || "";
    const postcode = selectedAddress.address.postcode || "";

    // Validate required fields
    if (!number || !street || !suburb || !state || !postcode) {
      setError(
        "Address is missing required information. Please select a complete address."
      );
      return;
    }

    // If not logged in, store the address and redirect to login
    if (!user || !accessToken) {
      // Store the property data in localStorage
      const propertyToSave = {
        unit: selectedAddress.address.unit,
        number,
        street,
        suburb,
        state,
        postcode,
        fullAddress: selectedAddress.display_name,
        coordinates: {
          lat: selectedAddress.lat,
          lon: selectedAddress.lon,
        },
      };
      localStorage.setItem(
        "pendingPropertySave",
        JSON.stringify(propertyToSave)
      );

      // Redirect to login page
      window.location.href = "/auth";
      return;
    }

    // User is logged in, proceed with save
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await propertyService.createProperty(
        {
          unit: selectedAddress.address.unit,
          number,
          street,
          suburb,
          state,
          postcode,
          fullAddress: selectedAddress.display_name,
          coordinates: {
            lat: selectedAddress.lat,
            lon: selectedAddress.lon,
          },
        },
        accessToken
      );

      if (response.success && response.data?.property) {
        // Redirect to the property details page
        navigate(`/properties/${response.data.property._id}`, {
          state: { message: "Property saved successfully!" },
        });
      } else {
        setError(response.message || "Failed to save property");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save property";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedAddress(null);
    setError(null);
    setShowSuggestions(false);
    setSaveSuccess(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Auto-save pending property after login
  useEffect(() => {
    const handlePendingPropertySave = async () => {
      const pendingPropertySave = localStorage.getItem("pendingPropertySave");
      const loginSuccess = localStorage.getItem("loginSuccess");

      if (pendingPropertySave && loginSuccess && user && accessToken) {
        try {
          const propertyData = JSON.parse(pendingPropertySave);

          setIsSaving(true);
          const response = await propertyService.createProperty(
            propertyData,
            accessToken
          );

          // Clean up
          localStorage.removeItem("pendingPropertySave");
          localStorage.removeItem("loginSuccess");

          // Redirect to the property details page if save was successful
          if (response.success && response.data?.property) {
            navigate(`/properties/${response.data.property._id}`, {
              state: { message: "Property saved successfully!" },
            });
          } else {
            setError(response.message || "Failed to save property");
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to save property";
          setError(errorMessage);
        } finally {
          setIsSaving(false);
        }
      }
    };

    handlePendingPropertySave();
  }, [user, accessToken]);

  return (
    <div className="address-search">
      <div className="search-header">
        <h1>Find Your Australian Address</h1>
        <p>Search for any address in Australia to get started</p>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Enter street address, suburb, or postcode..."
            className="search-input"
            aria-label="Address search"
            aria-autocomplete="list"
            aria-controls="suggestions-list"
            aria-expanded={showSuggestions && suggestions.length > 0}
          />

          {query && (
            <button
              onClick={handleClear}
              className="clear-button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          {isLoading && (
            <div className="loading-indicator" aria-label="Loading">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <ul
            id="suggestions-list"
            className="suggestions-list"
            role="listbox"
            aria-label="Address suggestions"
          >
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-item"
                role="option"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSuggestionClick(suggestion);
                  }
                }}
              >
                <div className="suggestion-content">
                  <div className="suggestion-main">
                    {suggestion.display_name}
                  </div>
                  {suggestion.address.postcode && (
                    <div className="suggestion-meta">
                      {suggestion.address.suburb &&
                        `${suggestion.address.suburb}, `}
                      {suggestion.address.state} {suggestion.address.postcode}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {query.length > 0 &&
          query.length < 3 &&
          !isLoading &&
          !selectedAddress && (
            <div className="hint-message">
              Type at least 3 characters to search
            </div>
          )}

        {selectedAddress && (
          <div className="selected-address">
            <div className="selected-address-header">
              <h3>Selected Address</h3>
              <button
                onClick={handleSaveProperty}
                disabled={isSaving || saveSuccess}
                className={`save-property-button ${
                  saveSuccess ? "success" : ""
                }`}
                aria-label="Save property"
              >
                {isSaving
                  ? "Saving..."
                  : saveSuccess
                  ? "✓ Saved!"
                  : "Save Property"}
              </button>
            </div>

            {!user && (
              <div className="login-prompt-inline">
                <p>Click "Save Property" to log in and save this address</p>
              </div>
            )}

            {saveSuccess && (
              <div className="success-message" role="status">
                Property saved successfully!
              </div>
            )}

            <div className="address-details">
              <p>
                <strong>Address:</strong> {selectedAddress.display_name}
              </p>
              {selectedAddress.address.unit && (
                <p>
                  <strong>Unit:</strong> {selectedAddress.address.unit}
                </p>
              )}
              {selectedAddress.address.house_number && (
                <p>
                  <strong>Number:</strong>{" "}
                  {selectedAddress.address.house_number}
                </p>
              )}
              {selectedAddress.address.road && (
                <p>
                  <strong>Street:</strong> {selectedAddress.address.road}
                </p>
              )}
              {selectedAddress.address.suburb && (
                <p>
                  <strong>Suburb:</strong> {selectedAddress.address.suburb}
                </p>
              )}
              {selectedAddress.address.city && (
                <p>
                  <strong>City:</strong> {selectedAddress.address.city}
                </p>
              )}
              {selectedAddress.address.state && (
                <p>
                  <strong>State:</strong> {selectedAddress.address.state}
                </p>
              )}
              {selectedAddress.address.postcode && (
                <p>
                  <strong>Postcode:</strong> {selectedAddress.address.postcode}
                </p>
              )}
              <p>
                <strong>Coordinates:</strong> {selectedAddress.lat},{" "}
                {selectedAddress.lon}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
