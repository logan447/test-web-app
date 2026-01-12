'use client';

import Image from 'next/image';
import Link from 'next/link';

type HiringRequestCardProps = {
  request: {
    id: string;
    status: string;
    message: string;
    createdAt: string;
    provider?: {
      id: string;
      name: string;
      providerType: string;
      coverPhoto?: string;
      photos?: string[];
      city?: string;
      state?: string;
    };
    sender: {
      id: string;
      name: string;
    };
    _count: {
      messages: number;
    };
  };
  activeTab: 'received' | 'sent';
  linkHref: string;
};

export default function EnhancedHiringRequestCard({
  request,
  activeTab,
  linkHref,
}: HiringRequestCardProps) {
  // Determine what to display based on tab
  const isReceived = activeTab === 'received';
  const displayName = isReceived ? request.sender.name : request.provider?.name || 'Unknown';
  const displayType = request.provider?.providerType
    ? formatProviderType(request.provider.providerType)
    : 'Organization';
  const displayLocation =
    request.provider?.city && request.provider?.state
      ? `${request.provider.city}, ${request.provider.state}`
      : null;

  // Get image URL
  const getImageUrl = () => {
    if (request.provider?.coverPhoto) return request.provider.coverPhoto;
    if (request.provider?.photos && request.provider.photos.length > 0)
      return request.provider.photos[0];
    return '/default-provider-image.jpg';
  };

  // Status badge styling and text
  const getStatusConfig = () => {
    switch (request.status) {
      case 'PENDING':
        return {
          color: isReceived
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-blue-100 text-blue-800 border-blue-200',
          text: isReceived ? 'Needs your response' : 'Waiting for reply',
        };
      case 'ACCEPTED':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Conversation started',
        };
      case 'DECLINED':
        return {
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          text: 'Declined',
        };
      case 'COMPLETED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          text: 'Completed',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          text: request.status,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // CTA button text
  const getCtaText = () => {
    if (request.status === 'PENDING' && isReceived) return 'Respond';
    if (request.status === 'ACCEPTED') return 'View Conversation';
    if (request.status === 'PENDING' && !isReceived) return 'View Request';
    return 'View Details';
  };

  return (
    <Link href={linkHref} className="group block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">
        {/* Image Section with Status Badge */}
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          <Image
            src={getImageUrl()}
            alt={displayName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Status Badge - Top Right */}
          <div className="absolute top-4 right-4">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color} backdrop-blur-sm shadow-sm`}
            >
              {statusConfig.text}
            </span>
          </div>

          {/* Date - Bottom Left */}
          <div className="absolute bottom-4 left-4 flex items-center text-white text-sm font-medium">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(request.createdAt)}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Organization/Caregiver Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {displayName}
          </h3>

          {/* Type */}
          <p className="text-sm font-medium text-gray-600 mb-3">{displayType}</p>

          {/* Location */}
          {displayLocation && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {displayLocation}
            </div>
          )}

          {/* Message Preview */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2 flex-1">
            {request.message}
          </p>

          {/* Footer - Unread Messages & CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Unread Messages Indicator */}
            {request._count.messages > 0 && (
              <div className="flex items-center text-sm text-primary-600 font-medium">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>
                  {request._count.messages}{' '}
                  {request._count.messages === 1 ? 'new message' : 'new messages'}
                </span>
              </div>
            )}

            {request._count.messages === 0 && (
              <div className="text-sm text-gray-500">No new messages</div>
            )}

            {/* CTA Button */}
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              {getCtaText()} →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatProviderType(type: string): string {
  const typeMap: Record<string, string> = {
    ASSISTED_LIVING: 'Assisted Living Facility',
    MEMORY_CARE: 'Memory Care Facility',
    NURSING_HOME: 'Nursing Home',
    INDEPENDENT_CAREGIVER: 'Independent Caregiver',
    HOME_CARE_AGENCY: 'Home Care Agency',
    ADULT_DAY_CARE: 'Adult Day Care Center',
  };
  return typeMap[type] || type.replace(/_/g, ' ');
}
