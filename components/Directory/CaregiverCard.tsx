"use client";

import Link from "next/link";
import Image from "next/image";
import { OleraScoreBadge } from "@/components/Trust/OleraScore";

interface CaregiverCardProps {
  caregiver: {
    id: string;
    name: string;
    description?: string | null;
    careTypesOffered?: string[];
    city: string;
    state: string;
    address?: string;
    yearsInBusiness?: number;
    licensed?: boolean;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    coverPhoto?: string | null;
    photos?: string[];
    verified?: boolean;
    backgroundChecked?: boolean;
    insuranceVerified?: boolean;
    certifications?: string[];
    averageRating?: number | null;
    reviewCount?: number;
    priceMin?: number | null;
    priceMax?: number | null;
    priceDescription?: string | null;
    serviceRadius?: number | null;
    claimed?: boolean;
    oleraScore?: number | null;
  };
  linkHref?: string;
  hasRequest?: boolean;
  isSaved?: boolean;
  onSave?: (caregiverId: string) => void;
  className?: string;
}

export default function CaregiverCard({
  caregiver,
  linkHref,
  hasRequest = false,
  isSaved = false,
  onSave,
  className = "",
}: CaregiverCardProps) {
  // Format care type for display
  const formatCareType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Get image URL with gradient fallback
  const imageUrl = caregiver.coverPhoto || caregiver.photos?.[0] || null;

  // Format price
  const formatPrice = () => {
    const { priceMin, priceMax } = caregiver;
    if (!priceMin && !priceMax) return null;

    if (priceMin && priceMax) {
      return `$${priceMin.toLocaleString()}-$${priceMax.toLocaleString()}/hr`;
    }
    if (priceMin) return `From $${priceMin.toLocaleString()}/hr`;
    if (priceMax) return `Up to $${priceMax.toLocaleString()}/hr`;
    return null;
  };

  const price = formatPrice();
  const careTypes = caregiver.careTypesOffered || [];
  const certifications = caregiver.certifications || [];
  const href = linkHref || `/caregiver/${caregiver.id}`;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(caregiver.id);
    }
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={caregiver.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

          {/* Verified Badge */}
          {caregiver.verified && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}

          {/* Request Sent Badge */}
          {hasRequest && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contacted
            </div>
          )}

          {/* Experience Badge */}
          {caregiver.yearsInBusiness && caregiver.yearsInBusiness > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-medium rounded-md shadow-sm">
              {caregiver.yearsInBusiness} {caregiver.yearsInBusiness === 1 ? "year" : "years"} exp
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Location */}
          <p className="text-sm text-gray-500 mb-1">
            {caregiver.city}, {caregiver.state}
          </p>

          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {caregiver.name}
          </h3>

          {/* Type & Certifications Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
              Independent Caregiver
            </span>
            {certifications.slice(0, 2).map((cert) => (
              <span key={cert} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                {cert}
              </span>
            ))}
            {certifications.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                +{certifications.length - 2} more
              </span>
            )}
          </div>

          {/* Description */}
          {caregiver.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {caregiver.description}
            </p>
          )}

          {/* Care Specialties */}
          {careTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {careTypes.slice(0, 3).map((type) => (
                <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {formatCareType(type)}
                </span>
              ))}
              {careTypes.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                  +{careTypes.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Price and Rating Row */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting at</p>
              <p className="font-semibold text-gray-900">
                {price || "Contact for rates"}
              </p>
            </div>
            <OleraScoreBadge
              provider={{
                name: caregiver.name,
                providerType: "INDEPENDENT_CAREGIVER",
                description: caregiver.description,
                address: caregiver.address,
                city: caregiver.city,
                state: caregiver.state,
                phone: caregiver.phone,
                email: caregiver.email,
                website: caregiver.website,
                careTypesOffered: caregiver.careTypesOffered,
                licensed: caregiver.licensed,
                backgroundChecked: caregiver.backgroundChecked,
                insuranceVerified: caregiver.insuranceVerified,
                coverPhoto: caregiver.coverPhoto,
                photos: caregiver.photos,
                priceMin: caregiver.priceMin,
                priceMax: caregiver.priceMax,
                priceDescription: caregiver.priceDescription,
                claimed: caregiver.claimed,
              }}
              averageRating={caregiver.averageRating ?? null}
              reviewCount={caregiver.reviewCount ?? 0}
              cachedScore={caregiver.oleraScore}
            />
          </div>

          {/* Service Radius */}
          {caregiver.serviceRadius && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Serves within {caregiver.serviceRadius} miles
            </div>
          )}

          {/* CTA Text */}
          <div className="mt-4 flex items-center text-sm font-medium text-primary-600">
            <span>{hasRequest ? "View Conversation" : "Schedule an Interview"}</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Save Button (if enabled) */}
        {onSave && (
          <button
            onClick={handleSaveClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            title={isSaved ? "Remove from saved" : "Save"}
          >
            <svg
              className={`w-5 h-5 ${isSaved ? "text-red-500 fill-current" : "text-gray-600"}`}
              viewBox="0 0 24 24"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
    </Link>
  );
}
