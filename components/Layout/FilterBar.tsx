"use client";

import { useState, useRef, useEffect } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  className = "",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label || label;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const isActive = value !== "";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors min-w-[140px] ${
          isActive
            ? "border-primary-500 bg-primary-50 text-primary-700"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-64 overflow-auto"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                value === option.value ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700"
              }`}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function LocationInput({
  value,
  onChange,
  placeholder = "City, State (e.g. Houston, TX)",
  className = "",
}: LocationInputProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear location"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  // Location filter
  showLocationFilter?: boolean;
  location?: string;
  onLocationChange?: (value: string) => void;
  locationPlaceholder?: string;

  // Dropdown filters
  filters?: FilterConfig[];
  values?: Record<string, string>;
  onFilterChange?: (filterId: string, value: string) => void;

  // Sort
  showSort?: boolean;
  sortOptions?: FilterOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;

  // Clear all
  onClearAll?: () => void;
  hasActiveFilters?: boolean;

  // Styling
  sticky?: boolean;
  className?: string;
}

export default function FilterBar({
  showLocationFilter = true,
  location = "",
  onLocationChange,
  locationPlaceholder,

  filters = [],
  values = {},
  onFilterChange,

  showSort = true,
  sortOptions = [],
  sortValue = "",
  onSortChange,

  onClearAll,
  hasActiveFilters,

  sticky = true,
  className = "",
}: FilterBarProps) {
  // Determine if any filters are active
  const isAnyFilterActive = hasActiveFilters !== undefined
    ? hasActiveFilters
    : location !== "" || Object.values(values).some((v) => v !== "");

  return (
    <div
      className={`bg-white border-b border-gray-200 ${sticky ? "sticky top-0 z-30" : ""} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Location Input */}
          {showLocationFilter && onLocationChange && (
            <LocationInput
              value={location}
              onChange={onLocationChange}
              placeholder={locationPlaceholder}
            />
          )}

          {/* Filter Dropdowns */}
          {filters.map((filter) => (
            <FilterDropdown
              key={filter.id}
              label={filter.label}
              value={values[filter.id] || ""}
              options={filter.options}
              onChange={(value) => onFilterChange?.(filter.id, value)}
            />
          ))}

          {/* Clear All Button */}
          {isAnyFilterActive && onClearAll && (
            <button
              onClick={onClearAll}
              className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort Dropdown */}
          {showSort && sortOptions.length > 0 && onSortChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <FilterDropdown
                label="Recommended"
                value={sortValue}
                options={sortOptions}
                onChange={onSortChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export sub-components for individual use
export { FilterDropdown, LocationInput };
