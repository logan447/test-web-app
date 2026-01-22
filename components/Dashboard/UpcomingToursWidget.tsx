"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Tour {
  id: string;
  proposedDate: string;
  proposedTime: string;
  status: string;
  notes: string | null;
  request: {
    id: string;
    provider: {
      id: string;
      name: string;
      providerType: string;
      address?: string;
      city?: string;
      state?: string;
      coverPhoto?: string | null;
    };
    familyProfile: {
      lovedOneName: string;
      profilePhoto?: string | null;
    };
    sender: {
      name: string;
    };
  };
}

export default function UpcomingToursWidget() {
  const { data: session } = useSession();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const isProviderMode = session?.user?.activeMode === 'PROVIDER';

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/tours');
      if (response.ok) {
        const data = await response.json();
        setTours(data.tours || []);
      }
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getDayOfMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Tours</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Tours</h2>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">No upcoming tours scheduled</p>
          {!isProviderMode && (
            <Link
              href="/providers"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
            >
              Browse providers to schedule tours →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upcoming Tours
          </h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {tours.length} scheduled
          </span>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {tours.map((tour) => (
          <Link
            key={tour.id}
            href={isProviderMode ? `/provider/requests/${tour.request.id}` : `/requests/${tour.request.id}`}
            className="block hover:bg-gray-50 rounded-lg p-3 border border-gray-200 transition-colors"
          >
            <div className="flex gap-4">
              {/* Calendar Icon Date */}
              <div className="flex-shrink-0">
                <div className="bg-primary-600 text-white rounded-lg w-14 h-14 flex flex-col items-center justify-center">
                  <span className="text-xs font-medium">{getMonth(tour.proposedDate)}</span>
                  <span className="text-xl font-bold">{getDayOfMonth(tour.proposedDate)}</span>
                </div>
              </div>

              {/* Tour Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {isProviderMode
                        ? `Tour with ${tour.request.sender.name}`
                        : tour.request.provider.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {isProviderMode
                        ? `For ${tour.request.familyProfile.lovedOneName}`
                        : `${tour.request.provider.address ? `${tour.request.provider.address}, ` : ''}${tour.request.provider.city}, ${tour.request.provider.state}`}
                    </p>
                  </div>
                  {tour.status === 'PENDING' && (
                    <span className="flex-shrink-0 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                  {tour.status === 'ACCEPTED' && (
                    <span className="flex-shrink-0 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Confirmed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{formatDate(tour.proposedDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{tour.proposedTime}</span>
                  </div>
                </div>

                {tour.notes && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    Note: {tour.notes}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <Link
          href={isProviderMode ? "/provider/requests" : "/requests"}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1"
        >
          View all requests
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
