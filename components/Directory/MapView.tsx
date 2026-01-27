"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Provider {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  // Optional fields for popup display
  address?: string;
  averageRating?: number | null;
  reviewCount?: number;
  priceMin?: number | null;
  priceMax?: number | null;
  verified?: boolean;
}

interface MapViewProps {
  providers: Provider[];
  onMarkerClick?: (id: string) => void;
}

export default function MapView({ providers, onMarkerClick }: MapViewProps) {
  // Filter providers with valid coordinates
  const providersWithCoords = providers.filter(
    (p) => p.latitude !== null && p.longitude !== null
  );

  // Calculate map center (average of all coordinates or default to US center)
  const center: [number, number] =
    providersWithCoords.length > 0
      ? [
          providersWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) /
            providersWithCoords.length,
          providersWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) /
            providersWithCoords.length,
        ]
      : [39.8283, -98.5795]; // Center of USA

  const formatProviderType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (providersWithCoords.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Locations Available
        </h3>
        <p className="text-gray-600">
          The providers in your results do not have location data for map view.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providersWithCoords.map((provider) => (
          <Marker
            key={provider.id}
            position={[provider.latitude!, provider.longitude!]}
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick?.(provider.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 pr-2">
                    {provider.name}
                  </h3>
                  {provider.verified && (
                    <span className="flex-shrink-0 flex items-center gap-1 bg-primary-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-sm text-primary-600 font-medium mb-1">
                  {formatProviderType(provider.providerType)}
                </p>

                <p className="text-sm text-gray-600 mb-2">
                  {provider.address && (
                    <>
                      {provider.address}
                      <br />
                    </>
                  )}
                  {provider.city}, {provider.state}
                </p>

                {provider.averageRating != null && (provider.reviewCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <svg
                      className="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">
                      {provider.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({provider.reviewCount})
                    </span>
                  </div>
                )}

                {(provider.priceMin || provider.priceMax) && (
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    {provider.priceMin && provider.priceMax
                      ? `$${provider.priceMin.toLocaleString()} - $${provider.priceMax.toLocaleString()}`
                      : provider.priceMin
                      ? `From $${provider.priceMin.toLocaleString()}`
                      : `Up to $${provider.priceMax?.toLocaleString()}`}
                    <span className="text-gray-600 font-normal">/month</span>
                  </p>
                )}

                <a
                  href={`/providers/${provider.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
