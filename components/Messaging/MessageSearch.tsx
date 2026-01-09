"use client";

import { useState } from "react";

export interface MessageSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  resultCount: number;
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

export interface SearchFilters {
  query: string;
  sender?: "all" | "me" | "other";
  dateFrom?: Date;
  dateTo?: Date;
}

export default function MessageSearch({
  onSearch,
  onClear,
  resultCount,
  currentIndex,
  onNext,
  onPrevious,
}: MessageSearchProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sender, setSender] = useState<"all" | "me" | "other">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSearch = () => {
    const filters: SearchFilters = {
      query,
      sender,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };
    onSearch(query, filters);
  };

  const handleClear = () => {
    setQuery("");
    setSender("all");
    setDateFrom("");
    setDateTo("");
    onClear();
  };

  const hasActiveSearch = query.trim().length > 0;

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Search Bar */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) {
                  handleSearch();
                } else {
                  handleClear();
                }
              }}
              placeholder="Search messages..."
              className="
                w-full px-4 py-2 pl-10
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                text-sm
              "
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`
              p-2 rounded-lg border
              ${showFilters ? "bg-primary-50 border-primary-300 text-primary-700" : "bg-white border-gray-300 text-gray-600"}
              hover:bg-gray-50
              transition-colors
            `}
            title="Filters"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>

          {/* Clear Button */}
          {hasActiveSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="
                px-3 py-2 rounded-lg
                bg-gray-100 text-gray-700
                hover:bg-gray-200
                transition-colors
                text-sm font-medium
              "
            >
              Clear
            </button>
          )}
        </div>

        {/* Result Counter & Navigation */}
        {hasActiveSearch && resultCount > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {currentIndex + 1} of {resultCount} results
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className="
                  p-1.5 rounded
                  hover:bg-gray-100
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors
                "
                title="Previous result"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={currentIndex >= resultCount - 1}
                className="
                  p-1.5 rounded
                  hover:bg-gray-100
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors
                "
                title="Next result"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {hasActiveSearch && resultCount === 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">No messages found</p>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-200 pt-3">
          {/* Sender Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by sender
            </label>
            <select
              value={sender}
              onChange={(e) => {
                setSender(e.target.value as "all" | "me" | "other");
                if (query.trim()) handleSearch();
              }}
              className="
                w-full px-3 py-1.5
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500
                text-sm
              "
            >
              <option value="all">All messages</option>
              <option value="me">My messages</option>
              <option value="other">Their messages</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  if (query.trim()) handleSearch();
                }}
                className="
                  w-full px-3 py-1.5
                  border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  text-sm
                "
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  if (query.trim()) handleSearch();
                }}
                className="
                  w-full px-3 py-1.5
                  border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                  text-sm
                "
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
