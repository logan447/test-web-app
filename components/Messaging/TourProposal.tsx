"use client";

import { format } from "date-fns";
import AddToCalendarButton from "@/components/Calendar/AddToCalendarButton";
import { buildCalendarEventFromTour } from "@/lib/calendarUtils";

export interface TourAppointment {
  id: string;
  proposedDate: Date;
  proposedTime: string;
  status: "PROPOSED" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  proposedBy: string;
}

export interface TourProposalProps {
  tour: TourAppointment;
  currentUserId: string;
  onAccept?: (tourId: string) => void;
  onDecline?: (tourId: string) => void;
  disabled?: boolean;
  engagementLabel?: string; // e.g., "Tour", "Consultation", "Interview"
  providerName?: string;
  providerLocation?: string;
}

export default function TourProposal({
  tour,
  currentUserId,
  onAccept,
  onDecline,
  disabled = false,
  engagementLabel = "Tour",
  providerName = "Provider",
  providerLocation,
}: TourProposalProps) {
  const isProposer = tour.proposedBy === currentUserId;
  const isPending = tour.status === "PROPOSED";
  const isAccepted = tour.status === "ACCEPTED";
  const isDeclined = tour.status === "DECLINED";
  const isCompleted = tour.status === "COMPLETED";
  const isCancelled = tour.status === "CANCELLED";

  // Status badge styling
  const getStatusBadge = () => {
    if (isAccepted) {
      return (
        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium">Confirmed</span>
        </div>
      );
    } else if (isDeclined) {
      return (
        <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2 py-1 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-xs font-medium">Declined</span>
        </div>
      );
    } else if (isCompleted) {
      return (
        <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium">Completed</span>
        </div>
      );
    } else if (isCancelled) {
      return (
        <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-xs font-medium">Cancelled</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium">Pending Response</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-white border-2 border-primary-200 rounded-xl p-4 shadow-sm max-w-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Scheduled {engagementLabel}</h3>
            <p className="text-xs text-gray-500">{isProposer ? "You proposed" : `${engagementLabel} invitation`}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Date & Time */}
      <div className="space-y-2 mb-3 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-900">
            {format(new Date(tour.proposedDate), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-900">{tour.proposedTime}</span>
        </div>
      </div>

      {/* Notes */}
      {tour.notes && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 italic">&quot;{tour.notes}&quot;</p>
        </div>
      )}

      {/* Action Buttons - only show if not proposer and status is PROPOSED */}
      {!isProposer && isPending && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onAccept?.(tour.id)}
            disabled={disabled}
            className="
              flex-1
              flex items-center justify-center gap-2
              px-4 py-2.5
              bg-primary-600 text-white
              rounded-lg
              hover:bg-primary-700
              active:bg-primary-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              font-medium text-sm
            "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept {engagementLabel}
          </button>
          <button
            onClick={() => onDecline?.(tour.id)}
            disabled={disabled}
            className="
              flex-1
              flex items-center justify-center gap-2
              px-4 py-2.5
              bg-white text-gray-700
              border-2 border-gray-300
              rounded-lg
              hover:bg-gray-50
              active:bg-gray-100
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              font-medium text-sm
            "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Decline
          </button>
        </div>
      )}

      {/* Status message for proposer */}
      {isProposer && isPending && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Waiting for response...</span>
        </div>
      )}

      {/* Confirmed message with Add to Calendar */}
      {isAccepted && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{engagementLabel} confirmed! See you there.</span>
          </div>
          <AddToCalendarButton
            event={buildCalendarEventFromTour({
              id: tour.id,
              proposedDate: tour.proposedDate,
              proposedTime: tour.proposedTime,
              notes: tour.notes,
              providerName,
              providerLocation,
              engagementType: engagementLabel.toUpperCase(),
            })}
            variant="secondary"
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
