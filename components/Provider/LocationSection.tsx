"use client";

interface LocationSectionProps {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number | null;
  longitude?: number | null;
  neighborhoodDescription?: string | null;
  nearbyAmenities: string[];
}

export default function LocationSection({
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
  neighborhoodDescription,
  nearbyAmenities,
}: LocationSectionProps) {
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  const encodedAddress = encodeURIComponent(fullAddress);

  // Use coordinates if available, otherwise fall back to address
  const mapQuery = latitude && longitude
    ? `${latitude},${longitude}`
    : encodedAddress;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 fade-in hover-lift mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <svg
          className="w-7 h-7 text-primary-600"
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
        Location & Neighborhood
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Map Section */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-4">
            <iframe
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${mapQuery}&zoom=14`}
              title="Location Map"
            />
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
            <p className="text-gray-900">{address}</p>
            <p className="text-gray-900">{city}, {state} {zipCode}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-flex items-center gap-1"
            >
              <span>Get Directions</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Neighborhood Info Section */}
        <div>
          {/* Neighborhood Description */}
          {neighborhoodDescription && (
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                About the Neighborhood
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {neighborhoodDescription}
              </p>
            </div>
          )}

          {/* Nearby Amenities */}
          {nearbyAmenities.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Nearby Amenities
              </h3>
              <div className="space-y-2">
                {nearbyAmenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no neighborhood info */}
          {!neighborhoodDescription && nearbyAmenities.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Neighborhood information coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
