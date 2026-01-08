"use client";

interface CompletenessItem {
  label: string;
  completed: boolean;
  required: boolean;
}

interface ProfileCompletenessProps {
  items: CompletenessItem[];
}

export default function ProfileCompleteness({ items }: ProfileCompletenessProps) {
  const totalItems = items.length;
  const completedItems = items.filter((item) => item.completed).length;
  const percentageComplete = Math.round((completedItems / totalItems) * 100);
  const requiredItems = items.filter((item) => item.required);
  const completedRequiredItems = requiredItems.filter((item) => item.completed);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Strength</h3>
        <span className="text-2xl font-bold text-primary-600">
          {percentageComplete}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              percentageComplete < 40
                ? "bg-red-500"
                : percentageComplete < 70
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${percentageComplete}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {percentageComplete < 40
            ? "Let's add more details to help providers understand your needs"
            : percentageComplete < 70
            ? "You're doing great! A few more details will strengthen your profile"
            : percentageComplete < 100
            ? "Excellent! Your profile is nearly complete"
            : "Perfect! Your profile is complete and ready to attract quality providers"}
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm font-medium text-gray-700 pb-2 border-b">
          <span>Profile Checklist</span>
          <span className="text-gray-500">
            {completedItems}/{totalItems} completed
          </span>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {item.completed ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
              )}
            </div>
            <div className="flex-1">
              <span
                className={`text-sm ${
                  item.completed ? "text-gray-700 line-through" : "text-gray-900"
                }`}
              >
                {item.label}
              </span>
              {item.required && !item.completed && (
                <span className="ml-2 text-xs text-red-600 font-medium">
                  Required
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Required Items Status */}
      {requiredItems.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {completedRequiredItems.length === requiredItems.length ? (
              <>
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-700">
                  All required fields completed!
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm font-medium text-amber-700">
                  {requiredItems.length - completedRequiredItems.length} required{" "}
                  {requiredItems.length - completedRequiredItems.length === 1
                    ? "field"
                    : "fields"}{" "}
                  remaining
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
