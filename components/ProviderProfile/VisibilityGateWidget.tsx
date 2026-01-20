"use client";

interface VisibilityGateWidgetProps {
  isVisible: boolean;
  meetsVisibility: boolean;
  missingRequired: string[];
  nudgeMessage: string;
  completionPercentage: number;
  onToggleVisibility: (visible: boolean) => void;
  isUpdating?: boolean;
}

export default function VisibilityGateWidget({
  isVisible,
  meetsVisibility,
  missingRequired,
  nudgeMessage,
  completionPercentage,
  onToggleVisibility,
  isUpdating = false,
}: VisibilityGateWidgetProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Visibility</h3>
        {isVisible ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Visible
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            Hidden
          </span>
        )}
      </div>

      {/* Visibility status message */}
      {isVisible ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Your profile is visible to families</p>
              <p className="text-sm text-green-700 mt-1">
                Families searching for care can find and contact you.
              </p>
            </div>
          </div>
        </div>
      ) : meetsVisibility ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Ready to go visible!</p>
              <p className="text-sm text-blue-700 mt-1">
                Your profile meets all requirements. Turn on visibility to let families find you.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Complete required fields to unlock visibility</p>
              <p className="text-sm text-amber-700 mt-1">{nudgeMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Missing fields list */}
      {!meetsVisibility && missingRequired.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Missing required fields:</p>
          <ul className="space-y-1">
            {missingRequired.map((field) => (
              <li key={field} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Profile Completion</span>
          <span className="font-medium text-gray-900">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completionPercentage >= 80
                ? "bg-green-500"
                : completionPercentage >= 50
                ? "bg-blue-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Toggle button */}
      {meetsVisibility && (
        <button
          type="button"
          onClick={() => onToggleVisibility(!isVisible)}
          disabled={isUpdating}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isVisible
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-primary-600 text-white hover:bg-primary-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUpdating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Updating...
            </span>
          ) : isVisible ? (
            "Hide Profile from Families"
          ) : (
            "Make Profile Visible"
          )}
        </button>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        {isVisible
          ? "Your profile appears in search results and families can contact you."
          : meetsVisibility
          ? "Once visible, families can find you and send inquiries."
          : "Complete the required fields above to unlock visibility."}
      </p>
    </div>
  );
}
