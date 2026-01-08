"use client";

interface ActiveFiltersProps {
  priceMin: number;
  priceMax: number;
  minRating: number;
  availability: string;
  amenities: string[];
  insurance: string[];
  languages: string[];
  onRemovePriceFilter: () => void;
  onRemoveRatingFilter: () => void;
  onRemoveAvailabilityFilter: () => void;
  onRemoveAmenity: (amenity: string) => void;
  onRemoveInsurance: (ins: string) => void;
  onRemoveLanguage: (lang: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  priceMin,
  priceMax,
  minRating,
  availability,
  amenities,
  insurance,
  languages,
  onRemovePriceFilter,
  onRemoveRatingFilter,
  onRemoveAvailabilityFilter,
  onRemoveAmenity,
  onRemoveInsurance,
  onRemoveLanguage,
  onClearAll,
}: ActiveFiltersProps) {
  const hasPriceFilter = priceMin > 0 || priceMax < 15000;
  const hasRatingFilter = minRating > 0;
  const hasAvailabilityFilter = availability !== "";
  const hasAmenityFilters = amenities.length > 0;
  const hasInsuranceFilters = insurance.length > 0;
  const hasLanguageFilters = languages.length > 0;

  const hasAnyFilters =
    hasPriceFilter ||
    hasRatingFilter ||
    hasAvailabilityFilter ||
    hasAmenityFilters ||
    hasInsuranceFilters ||
    hasLanguageFilters;

  if (!hasAnyFilters) return null;

  const formatAmenity = (amenity: string) => {
    return amenity
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">Active Filters</h4>
        <button
          onClick={onClearAll}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Price Filter */}
        {hasPriceFilter && (
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <span>
              ${priceMin.toLocaleString()} - ${priceMax.toLocaleString()}/mo
            </span>
            <button
              onClick={onRemovePriceFilter}
              className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
              aria-label="Remove price filter"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Rating Filter */}
        {hasRatingFilter && (
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="flex items-center gap-1">
              {minRating}+
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            <button
              onClick={onRemoveRatingFilter}
              className="hover:bg-yellow-100 rounded-full p-0.5 transition-colors"
              aria-label="Remove rating filter"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Availability Filter */}
        {hasAvailabilityFilter && (
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <span>Spots available now</span>
            <button
              onClick={onRemoveAvailabilityFilter}
              className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
              aria-label="Remove availability filter"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Amenity Filters */}
        {amenities.map((amenity) => (
          <div
            key={amenity}
            className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <span>{formatAmenity(amenity)}</span>
            <button
              onClick={() => onRemoveAmenity(amenity)}
              className="hover:bg-purple-100 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${formatAmenity(amenity)} filter`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Insurance Filters */}
        {insurance.map((ins) => (
          <div
            key={ins}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <span>{ins}</span>
            <button
              onClick={() => onRemoveInsurance(ins)}
              className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${ins} filter`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Language Filters */}
        {languages.map((lang) => (
          <div
            key={lang}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <span>{lang}</span>
            <button
              onClick={() => onRemoveLanguage(lang)}
              className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${lang} filter`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
