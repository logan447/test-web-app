"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface LocationResult {
  id: string;
  city: string;
  state: string;
  stateName: string;
  displayName: string;
  population?: number;
  latitude?: number;
  longitude?: number;
  zipCode?: string; // Present when result came from ZIP code lookup
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, location?: LocationResult) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  size?: "default" | "large";
  showIcon?: boolean;
  showCurrentLocation?: boolean; // Show "Use current location" option in dropdown
  autoFocus?: boolean; // Auto-focus the input on mount
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * LocationAutocomplete - Airbnb/Zillow-quality location selector
 *
 * Features:
 * - Debounced search (300ms)
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Population-ranked results for relevance
 * - 65+ friendly design (large touch targets, clear text)
 */
export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "City, State",
  className = "",
  inputClassName = "",
  disabled = false,
  required = false,
  error,
  size = "default",
  showIcon = true,
  showCurrentLocation = false,
  autoFocus = false,
  onFocus,
  onBlur,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHint, setSearchHint] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "location-listbox";
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoFocusingRef = useRef(false); // Track if focus came from autoFocus prop

  // Handle geolocation request
  const handleUseCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const state = data.address?.state || "";
          if (city && state) {
            const displayName = `${city}, ${state}`;
            setInputValue(displayName);
            onChange(displayName, {
              id: `geo-${city}-${state}`,
              city,
              state,
              stateName: state,
              displayName,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setIsOpen(false);
          }
        } catch {
          // Silently fail
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => {
        setIsGettingLocation(false);
      }
    );
  }, [onChange]);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Auto-focus the input when autoFocus prop is true
  // Note: Does NOT open dropdown - keeps UI clean and focused on the input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Small delay to ensure DOM is ready (especially after navigation)
      const timer = setTimeout(() => {
        isAutoFocusingRef.current = true; // Flag to prevent dropdown from opening
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Search locations with debounce
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      setSearchHint(null);
      return;
    }

    setIsLoading(true);
    setSearchHint(null);

    try {
      const response = await fetch(
        `/api/locations/search?q=${encodeURIComponent(query)}&limit=8`
      );

      if (response.ok) {
        const data = await response.json();
        const locations = data.locations || [];
        setResults(locations);
        setIsOpen(true); // Always open to show results or "no results" message
        setHighlightedIndex(-1);
        setHasSearched(true);

        // Handle ZIP code hint from API
        if (data.hint) {
          setSearchHint(data.hint);
        }
      }
    } catch (err) {
      console.error("Location search failed:", err);
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent immediately for controlled input

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
  };

  // Handle selection
  const handleSelect = (location: LocationResult) => {
    setInputValue(location.displayName);
    onChange(location.displayName, location);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "ArrowDown" && inputValue.length >= 2) {
        searchLocations(inputValue);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      case "Tab":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const item = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const sizeClasses = size === "large"
    ? "px-4 py-3.5 text-lg"
    : "px-4 py-2.5 text-base";

  const iconSizeClasses = size === "large" ? "w-6 h-6" : "w-5 h-5";

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {showIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className={`${iconSizeClasses} text-gray-400`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            // Skip opening dropdown if this focus came from autoFocus prop
            // (keeps UI clean on navigation from situation cards)
            if (isAutoFocusingRef.current) {
              isAutoFocusingRef.current = false; // Reset flag
            } else {
              // Open dropdown on manual focus if showCurrentLocation is enabled
              if (showCurrentLocation) {
                setIsOpen(true);
              }
              if (inputValue.length >= 2) {
                searchLocations(inputValue);
              }
            }
            // Move cursor to end without selecting text (prevents blue highlight)
            const len = e.target.value.length;
            setTimeout(() => {
              e.target.setSelectionRange(len, len);
            }, 0);
            onFocus?.();
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full border rounded-lg
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            caret-primary-600
            ${showIcon ? "pl-11" : ""}
            ${sizeClasses}
            ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
            ${inputClassName}
          `}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          role="combobox"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id={listboxId}
          className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          role="listbox"
        >
          {/* "Use current location" option - shown at top when enabled */}
          {showCurrentLocation && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              className={`
                w-full px-4 py-3 text-left flex items-center gap-3
                transition-colors hover:bg-gray-50
                ${results.length > 0 || hasSearched ? "border-b border-gray-100" : ""}
              `}
            >
              {isGettingLocation ? (
                <svg
                  className="animate-spin w-5 h-5 text-primary-500 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-primary-500 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2v2m0 16v2m10-10h-2M4 12H2"
                  />
                </svg>
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {isGettingLocation ? "Getting location..." : "Current Location"}
                </div>
                <div className="text-sm text-gray-500">Use your device location</div>
              </div>
            </button>
          )}

          {results.length > 0 ? (
            results.map((location, index) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleSelect(location)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  w-full px-4 py-3 text-left flex items-center gap-3
                  transition-colors
                  ${
                    index === highlightedIndex
                      ? "bg-primary-50 text-primary-900"
                      : "hover:bg-gray-50"
                  }
                  ${index !== results.length - 1 ? "border-b border-gray-100" : ""}
                `}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <svg
                  className="w-5 h-5 text-gray-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">
                    {location.city}, {location.state}
                  </div>
                  <div className="text-sm text-gray-500">
                    {location.zipCode ? `ZIP ${location.zipCode}` : location.stateName}
                  </div>
                </div>
              </button>
            ))
          ) : hasSearched && !isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              {searchHint ? (
                <>
                  <svg
                    className="w-6 h-6 mx-auto mb-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  <p className="text-sm">{searchHint}</p>
                </>
              ) : (
                <>
                  <svg
                    className="w-6 h-6 mx-auto mb-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <p className="text-sm">No locations found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a city name or 5-digit ZIP code</p>
                </>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
