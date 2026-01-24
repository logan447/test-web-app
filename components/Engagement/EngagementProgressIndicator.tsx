"use client";

/**
 * EngagementProgressIndicator - Visual step progress from request to meet
 *
 * States:
 * - PENDING: Request sent, waiting for provider response
 * - ACCEPTED: Provider responded, ready to schedule
 * - TOUR_PROPOSED: Times proposed, waiting for confirmation
 * - SCHEDULED: Meeting scheduled, ready to meet
 * - COMPLETED: Meeting completed
 */

interface ProgressStep {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming";
}

interface EngagementProgressIndicatorProps {
  status: string;
  hasTourProposed?: boolean;
  hasTourScheduled?: boolean;
}

export default function EngagementProgressIndicator({
  status,
  hasTourProposed = false,
  hasTourScheduled = false,
}: EngagementProgressIndicatorProps) {
  // Determine step statuses based on engagement state
  const getSteps = (): ProgressStep[] => {
    const steps: ProgressStep[] = [
      { id: "request", label: "Request Sent", status: "completed" },
      { id: "response", label: "Provider Response", status: "upcoming" },
      { id: "schedule", label: "Schedule", status: "upcoming" },
      { id: "meet", label: "Meet", status: "upcoming" },
    ];

    // Update based on current status
    if (status === "PENDING") {
      steps[1].status = "current";
    } else if (status === "ACCEPTED") {
      steps[1].status = "completed";
      if (hasTourProposed) {
        steps[2].status = "current";
      } else if (hasTourScheduled) {
        steps[2].status = "completed";
        steps[3].status = "current";
      } else {
        steps[2].status = "current";
      }
    } else if (status === "COMPLETED") {
      steps[1].status = "completed";
      steps[2].status = "completed";
      steps[3].status = "completed";
    } else if (status === "DECLINED") {
      steps[1].status = "completed";
    }

    // Handle tour states
    if (hasTourScheduled) {
      steps[2].status = "completed";
      steps[3].status = status === "COMPLETED" ? "completed" : "current";
    } else if (hasTourProposed) {
      steps[2].status = "current";
    }

    return steps;
  };

  const steps = getSteps();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step.status === "completed"
                    ? "bg-primary-600 text-white"
                    : step.status === "current"
                    ? "bg-primary-100 text-primary-700 border-2 border-primary-600"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                }`}
              >
                {step.status === "completed" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.status === "current" ? (
                  <div className="w-3 h-3 bg-primary-600 rounded-full" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                  step.status === "completed"
                    ? "text-primary-700"
                    : step.status === "current"
                    ? "text-primary-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  steps[index + 1].status === "completed" || steps[index + 1].status === "current"
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
