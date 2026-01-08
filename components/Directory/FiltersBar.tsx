"use client";

import { useState } from "react";

interface FiltersBarProps {
  priceMin: number;
  priceMax: number;
  minRating: number;
  availability: string;
  amenities: string[];
  insurance: string[];
  languages: string[];
  onPriceChange: (min: number, max: number) => void;
  onRatingChange: (rating: number) => void;
  onAvailabilityChange: (availability: string) => void;
  onAmenitiesChange: (amenities: string[]) => void;
  onInsuranceChange: (insurance: string[]) => void;
  onLanguagesChange: (languages: string[]) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function FiltersBar({
  priceMin,
  priceMax,
  minRating,
  availability,
  amenities,
  insurance,
  languages,
  onPriceChange,
  onRatingChange,
  onAvailabilityChange,
  onAmenitiesChange,
  onInsuranceChange,
  onLanguagesChange,
  onApplyFilters,
  onClearFilters,
}: FiltersBarProps) {
  const [localPriceMin, setLocalPriceMin] = useState(priceMin);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);

  const handleAmenityToggle = (amenity: string) => {
    if (amenities.includes(amenity)) {
      onAmenitiesChange(amenities.filter((a) => a !== amenity));
    } else {
      onAmenitiesChange([...amenities, amenity]);
    }
  };

  const handleInsuranceToggle = (ins: string) => {
    if (insurance.includes(ins)) {
      onInsuranceChange(insurance.filter((i) => i !== ins));
    } else {
      onInsuranceChange([...insurance, ins]);
    }
  };

  const handleLanguageToggle = (lang: string) => {
    if (languages.includes(lang)) {
      onLanguagesChange(languages.filter((l) => l !== lang));
    } else {
      onLanguagesChange([...languages, lang]);
    }
  };

  const handlePriceChange = () => {
    onPriceChange(localPriceMin, localPriceMax);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Price Range (Monthly)
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={localPriceMin}
                onChange={(e) => setLocalPriceMin(parseInt(e.target.value) || 0)}
                onBlur={handlePriceChange}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={localPriceMax}
                onChange={(e) => setLocalPriceMax(parseInt(e.target.value) || 15000)}
                onBlur={handlePriceChange}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>${localPriceMin.toLocaleString()}</span>
              <span>${localPriceMax.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Minimum Rating
          </label>
          <div className="space-y-2">
            {[0, 3, 3.5, 4, 4.5, 5].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === rating}
                  onChange={() => onRatingChange(rating)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center gap-1">
                  {rating === 0 ? (
                    <span className="text-sm text-gray-700">Any rating</span>
                  ) : (
                    <>
                      <span className="text-sm text-gray-700">{rating}+</span>
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Availability
          </label>
          <div className="space-y-2">
            {[
              { value: "", label: "Any" },
              { value: "immediate", label: "Spots available now" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="radio"
                  name="availability"
                  checked={availability === option.value}
                  onChange={() => onAvailabilityChange(option.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities (Specialty Care) */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Specialty Care
          </label>
          <div className="space-y-2">
            {[
              { value: "memory_care", label: "Memory Care" },
              { value: "respite_care", label: "Respite Care" },
              { value: "hospice_care", label: "Hospice Care" },
            ].map((amenity) => (
              <label
                key={amenity.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity.value)}
                  onChange={() => handleAmenityToggle(amenity.value)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Insurance/Payment */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Payment Options
          </label>
          <div className="space-y-2">
            {[
              { value: "Medicaid", label: "Medicaid Accepted" },
              { value: "Medicare", label: "Medicare Accepted" },
              { value: "Private Pay", label: "Private Pay" },
              { value: "Veterans Benefits", label: "Veterans Benefits" },
              { value: "Long-term Care Insurance", label: "Long-term Care Insurance" },
            ].map((ins) => (
              <label
                key={ins.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={insurance.includes(ins.value)}
                  onChange={() => handleInsuranceToggle(ins.value)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{ins.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Languages Spoken
          </label>
          <div className="space-y-2">
            {[
              { value: "Spanish", label: "Spanish" },
              { value: "Chinese", label: "Chinese" },
              { value: "Vietnamese", label: "Vietnamese" },
              { value: "Korean", label: "Korean" },
              { value: "Tagalog", label: "Tagalog" },
            ].map((lang) => (
              <label
                key={lang.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={languages.includes(lang.value)}
                  onChange={() => handleLanguageToggle(lang.value)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{lang.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <div className="border-t border-gray-100 pt-6">
          <button
            onClick={onApplyFilters}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-smooth shadow-sm hover:shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
