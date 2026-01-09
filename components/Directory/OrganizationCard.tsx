"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface OrganizationCardProps {
  organization: {
    id: string;
    name: string;
    providerType: string;
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
    insuranceVerified?: boolean;
  };
  linkHref: string;
  hasRequest?: boolean;
}

export default function OrganizationCard({
  organization,
  linkHref,
  hasRequest = false,
}: OrganizationCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatProviderType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatCareType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getImageUrl = () => {
    if (organization.coverPhoto) return organization.coverPhoto;
    if (organization.photos && organization.photos.length > 0) return organization.photos[0];
    return "/default-provider-image.jpg";
  };

  return (
    <Link
      href={linkHref}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift block"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={organization.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {organization.verified && (
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
          {organization.licensed && (
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

        {/* Years in Business Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
            {organization.yearsInBusiness} {organization.yearsInBusiness === 1 ? "year" : "years"} in business
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
            {organization.name}
          </h3>

          <p className="text-sm text-primary-600 font-medium mb-1">
            {formatProviderType(organization.providerType)}
          </p>

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
            {organization.city}, {organization.state}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
          {organization.description}
        </p>

        {/* Care Types */}
        {organization.careTypesOffered && organization.careTypesOffered.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Services Offered</p>
            <div className="flex flex-wrap gap-2">
              {organization.careTypesOffered.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200"
                >
                  {formatCareType(type)}
                </span>
              ))}
              {organization.careTypesOffered.length > 3 && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  +{organization.careTypesOffered.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {organization.licensed && (
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
          {organization.insuranceVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Insured
            </span>
          )}
          {organization.backgroundChecked && (
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
            <span>{hasRequest ? "View Request" : "View Details"}</span>
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
