"use client";

import { useState } from "react";

export interface FamilyFilters {
  city: string;
  state: string;
  careTypes: string[];
  budgetMin: number;
  budgetMax: number;
  timeline: string;
}

interface FamilyFiltersBarProps {
  filters: FamilyFilters;
  onFilterChange: (filters: FamilyFilters) => void;
  onSearch: () => void;
  onClear: () => void;
}

const CARE_TYPE_OPTIONS = [
  { value: "ASSISTED_LIVING", label: "Assisted Living" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "INDEPENDENT_LIVING", label: "Independent Living" },
  { value: "HOME_CARE", label: "Home Care" },
  { value: "HOME_HEALTH", label: "Home Health" },
  { value: "HOSPICE", label: "Hospice Care" },
  { value: "REHABILITATION", label: "Rehabilitation" },
];

const TIMELINE_OPTIONS = [
  { value: "", label: "Any Timeline" },
  { value: "Immediate (within 1 week)", label: "Immediate (within 1 week)" },
  { value: "1-2 weeks", label: "1-2 weeks" },
  { value: "1-3 months", label: "1-3 months" },
  { value: "3-6 months", label: "3-6 months" },
  { value: "Exploring options", label: "Exploring options" },
];

export default function FamilyFiltersBar({
  filters,
  onFilterChange,
  onSearch,
  onClear,
}: FamilyFiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCareTypeToggle = (careType: string) => {
    const newCareTypes = filters.careTypes.includes(careType)
      ? filters.careTypes.filter((t) => t !== careType)
      : [...filters.careTypes, careType];

    onFilterChange({ ...filters, careTypes: newCareTypes });
  };

  const activeFilterCount = [
    filters.city && 1,
    filters.state && 1,
    filters.careTypes.length > 0 && 1,
    filters.budgetMin > 0 && 1,
    filters.budgetMax < 15000 && 1,
    filters.timeline && 1,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Main Filters */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
                </svg>
              </div>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
                placeholder="e.g., San Francisco"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              value={filters.state}
              onChange={(e) => onFilterChange({ ...filters, state: e.target.value })}
              placeholder="e.g., CA"
              maxLength={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase transition-colors"
            />
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timeline
            </label>
            <select
              value={filters.timeline}
              onChange={(e) => onFilterChange({ ...filters, timeline: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            >
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={onSearch}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={onClear}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                title="Clear all filters"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showAdvanced ? "Hide" : "Show"} Advanced Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          {/* Care Types */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Care Types Needed
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CARE_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`
                    relative flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      filters.careTypes.includes(option.value)
                        ? "bg-primary-50 border-primary-500 text-primary-700"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={filters.careTypes.includes(option.value)}
                    onChange={() => handleCareTypeToggle(option.value)}
                    className="sr-only"
                  />
                  <div
                    className={`
                    w-5 h-5 rounded flex items-center justify-center border-2 transition-colors
                    ${
                      filters.careTypes.includes(option.value)
                        ? "bg-primary-600 border-primary-600"
                        : "bg-white border-gray-300"
                    }
                  `}
                  >
                    {filters.careTypes.includes(option.value) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Monthly Budget Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={filters.budgetMin || ""}
                    onChange={(e) =>
                      onFilterChange({ ...filters, budgetMin: Number(e.target.value) || 0 })
                    }
                    placeholder="0"
                    min="0"
                    step="500"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={filters.budgetMax === 15000 ? "" : filters.budgetMax}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        budgetMax: Number(e.target.value) || 15000,
                      })
                    }
                    placeholder="15,000+"
                    min={filters.budgetMin || 0}
                    step="500"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Showing families with budgets: ${filters.budgetMin.toLocaleString()} - $
              {filters.budgetMax === 15000 ? "15,000+" : filters.budgetMax.toLocaleString()}/month
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
