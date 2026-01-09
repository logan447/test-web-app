"use client";

import { useState } from "react";
import { format } from "date-fns";
import TourScheduler from "./TourScheduler";
import { supportsTours } from "@/lib/providerUtils";
import { ProviderType } from "@prisma/client";

interface Tour {
  id: string;
  proposedDate: string;
  proposedTime: string;
  status: string;
  notes: string | null;
  proposedBy: string;
}

interface ToursSectionProps {
  requestId: string;
  providerType: ProviderType;
  tours: Tour[];
  currentUserId: string;
  isProvider: boolean;
  onProposeTour: (date: Date, time: string, notes?: string) => Promise<void>;
  onAcceptTour: (tourId: string) => void;
  onDeclineTour: (tourId: string) => void;
}

export default function ToursSection({
  requestId,
  providerType,
  tours,
  currentUserId,
  isProvider,
  onProposeTour,
  onAcceptTour,
  onDeclineTour,
}: ToursSectionProps) {
  const [showScheduler, setShowScheduler] = useState(false);
  const [proposing, setProposing] = useState(false);

  // Only show tours section for facility types that support tours
  if (!supportsTours(providerType)) {
    return null;
  }

  const handlePropose = async (date: Date, time: string, notes?: string) => {
    try {
      setProposing(true);
      await onProposeTour(date, time, notes);
      setShowScheduler(false);
    } catch (error) {
      console.error('Failed to propose tour:', error);
    } finally {
      setProposing(false);
    }
  };

  const formatTourDate = (dateString: string) => {
    try {
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
        return format(date, "EEEE, MMM d, yyyy");
      }
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Facility Tours</h3>
        </div>
        {!showScheduler && tours.length === 0 && (
          <span className="text-sm text-gray-500">No tours scheduled yet</span>
        )}
      </div>

      {/* Existing Tours */}
      {tours.length > 0 && (
        <div className="space-y-3 mb-4">
          {tours.map((tour) => {
            const isPending = tour.status === 'PENDING';
            const canRespond = isPending && tour.proposedBy !== currentUserId;

            return (
              <div
                key={tour.id}
                className={`border-2 rounded-lg p-4 ${getStatusColor(tour.status)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {formatTourDate(tour.proposedDate)}
                      </span>
                      <span className="text-gray-600">at</span>
                      <span className="font-semibold text-gray-900">{tour.proposedTime}</span>
                    </div>
                    {tour.notes && (
                      <p className="text-sm text-gray-700 mb-2 italic">&quot;{tour.notes}&quot;</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full border font-medium ${getStatusColor(tour.status)}`}>
                        {tour.status}
                      </span>
                      <span className="text-gray-500">
                        {tour.proposedBy === currentUserId ? 'Proposed by you' : isProvider ? 'Proposed by family' : 'Proposed by provider'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons for Pending Tours */}
                  {canRespond && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAcceptTour(tour.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onDeclineTour(tour.id)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium rounded transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tour Scheduler */}
      {showScheduler ? (
        <div className="mt-4">
          <TourScheduler
            onPropose={handlePropose}
            onCancel={() => setShowScheduler(false)}
            disabled={proposing}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowScheduler(true)}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Schedule a Tour
        </button>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center">
        {isProvider
          ? 'Propose tour times for families to visit your facility'
          : 'Schedule a visit to tour the facility in person'}
      </p>
    </div>
  );
}
