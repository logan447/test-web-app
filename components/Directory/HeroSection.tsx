"use client";

import { useState } from "react";

interface HeroSectionProps {
  onSearch: (city: string, state: string, careType: string) => void;
  initialCity?: string;
  initialState?: string;
  initialCareType?: string;
  totalProviders?: number;
}

export default function HeroSection({
  onSearch,
  initialCity = "",
  initialState = "",
  initialCareType = "",
  totalProviders = 1000,
}: HeroSectionProps) {
  const [location, setLocation] = useState(
    initialCity && initialState ? `${initialCity}, ${initialState}` : ""
  );
  const [careType, setCareType] = useState(initialCareType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse location into city and state
    let city = "";
    let state = "";

    if (location) {
      const parts = location.split(",").map(s => s.trim());
      if (parts.length >= 2) {
        city = parts[0];
        state = parts[1];
      } else {
        city = parts[0];
      }
    }

    onSearch(city, state, careType);
  };

  return (
    <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-10 fade-in">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Find the Perfect Senior Care
            <br />
            <span className="text-primary-100">for Your Loved One</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-50 max-w-3xl mx-auto">
            Browse {totalProviders.toLocaleString()}+ care providers. Real reviews. Transparent pricing.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-12 scale-in">
          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Location Input */}
              <div className="flex-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city, state (e.g., Los Angeles, CA)"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              </div>

              {/* Care Type Dropdown */}
              <div className="flex-1">
                <label htmlFor="careType" className="block text-sm font-medium text-gray-700 mb-2">
                  Care Type
                </label>
                <select
                  id="careType"
                  value={careType}
                  onChange={(e) => setCareType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg bg-white"
                >
                  <option value="">All Care Types</option>
                  <option value="HOME_CARE">Home Care</option>
                  <option value="ASSISTED_LIVING">Assisted Living</option>
                  <option value="MEMORY_CARE">Memory Care</option>
                  <option value="INDEPENDENT_LIVING">Independent Living</option>
                  <option value="NURSING_HOME">Nursing Home</option>
                  <option value="HOSPICE">Hospice</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="md:pt-8">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-smooth shadow-lg hover:shadow-xl text-lg"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto slide-in">
          {/* Verified Providers */}
          <div className="flex items-center justify-center gap-3 text-white">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{(totalProviders / 2).toLocaleString()}+</p>
              <p className="text-sm text-primary-100">Verified Providers</p>
            </div>
          </div>

          {/* Families Helped */}
          <div className="flex items-center justify-center gap-3 text-white">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">50,000+</p>
              <p className="text-sm text-primary-100">Families Helped</p>
            </div>
          </div>

          {/* Average Rating */}
          <div className="flex items-center justify-center gap-3 text-white">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">4.7 ★</p>
              <p className="text-sm text-primary-100">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
