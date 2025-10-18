import { useState, useCallback, useEffect, useRef } from "react";
import { addressService } from "../services/addressService";
import type { AddressSuggestion } from "../types/address";
import "./AddressSearch.css";

export function AddressSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedAddress(null);
    setError(null);
    setShowSuggestions(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
            <h3>Selected Address</h3>
            <div className="address-details">
              <p>
                <strong>Address:</strong> {selectedAddress.display_name}
              </p>
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
