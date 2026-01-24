"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface CaregiverCardProps {
  caregiver: {
    id: string;
    name: string;
    description: string;
    careTypesOffered: string[];
    city: string;
    state: string;
    yearsInBusiness: number;
    licensed: boolean;
    email: string;
    phone: string;
    coverPhoto?: string | null;
    photos?: string[];
    verified?: boolean;
    backgroundChecked?: boolean;
    certifications?: string[];
    averageRating?: number | null;
    reviewCount?: number;
  };
  linkHref: string;
  hasRequest?: boolean;
  isSaved?: boolean;
  onSave?: (caregiverId: string) => void;
}

export default function CaregiverCard({
  caregiver,
  linkHref,
  hasRequest = false,
  isSaved = false,
  onSave,
}: CaregiverCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatCareType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getImageUrl = () => {
    if (caregiver.coverPhoto) return caregiver.coverPhoto;
    if (caregiver.photos && caregiver.photos.length > 0) return caregiver.photos[0];
    return "/default-provider-image.jpg";
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(caregiver.id);
    }
  };

  return (
    <Link
      href={linkHref}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden block"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={caregiver.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {caregiver.verified && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
          {caregiver.licensed && (
            <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Licensed
            </span>
          )}
          {hasRequest && (
            <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Request Sent
            </span>
          )}
        </div>

        {/* Save/Heart Button */}
        {onSave && (
          <div className="absolute top-3 right-3">
            <button
              onClick={handleSaveClick}
              className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all"
              title={isSaved ? "Remove from saved" : "Save caregiver"}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  isSaved ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-500"
                }`}
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        )}

        {/* Experience Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
            {caregiver.yearsInBusiness} {caregiver.yearsInBusiness === 1 ? "year" : "years"} experience
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
            {caregiver.name}
          </h3>

          <p className="text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            {caregiver.city}, {caregiver.state}
          </p>
        </div>

        {/* Rating */}
        {caregiver.averageRating != null && caregiver.reviewCount && caregiver.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-gray-900">{caregiver.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-600">
              ({caregiver.reviewCount} {caregiver.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
          {caregiver.description}
        </p>

        {/* Care Types */}
        {caregiver.careTypesOffered && caregiver.careTypesOffered.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Care Specialties</p>
            <div className="flex flex-wrap gap-2">
              {caregiver.careTypesOffered.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-200"
                >
                  {formatCareType(type)}
                </span>
              ))}
              {caregiver.careTypesOffered.length > 3 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  +{caregiver.careTypesOffered.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {caregiver.certifications && caregiver.certifications.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {caregiver.certifications.slice(0, 2).map((cert) => (
                <span
                  key={cert}
                  className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-200"
                >
                  {cert}
                </span>
              ))}
              {caregiver.certifications.length > 2 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  +{caregiver.certifications.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {caregiver.licensed && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Licensed
            </span>
          )}
          {caregiver.backgroundChecked && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Background Checked
            </span>
          )}
        </div>

        {/* View Details Button */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm font-medium text-primary-600">
            <span>{hasRequest ? "View Request" : "View Profile"}</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
