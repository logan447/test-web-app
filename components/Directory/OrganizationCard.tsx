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
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden block transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={organization.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-6rem)]">
          {organization.verified && (
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
            <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
              Licensed
            </span>
          )}
          {hasRequest && (
            <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm">
            {organization.yearsInBusiness} {organization.yearsInBusiness === 1 ? "yr" : "yrs"} in business
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2 leading-tight">
            {organization.name}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200">
              {formatProviderType(organization.providerType)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <span className="font-medium">{organization.city}, {organization.state}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 pb-4 border-b border-gray-100">
          {organization.description}
        </p>

        {/* Care Types */}
        {organization.careTypesOffered && organization.careTypesOffered.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Services Offered</p>
            <div className="flex flex-wrap gap-2">
              {organization.careTypesOffered.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {formatCareType(type)}
                </span>
              ))}
              {organization.careTypesOffered.length > 3 && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200">
                  +{organization.careTypesOffered.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-3 mb-4">
          {organization.licensed && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
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
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
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
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
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

        {/* View Details CTA */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 group-hover:from-primary-700 group-hover:to-primary-800 rounded-xl transition-all">
            <span className="text-sm font-bold text-white">{hasRequest ? "View Request" : "View Full Profile"}</span>
            <svg
              className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
