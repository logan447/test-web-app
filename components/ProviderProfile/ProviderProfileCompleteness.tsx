"use client";

interface CompletenessItem {
  label: string;
  completed: boolean;
  required: boolean;
}

interface ProviderProfileCompletenessProps {
  items: CompletenessItem[];
  // Pass completion data directly from API for consistency
  completionPercentage?: number;
  completedSections?: number;
  totalSections?: number;
}

export default function ProviderProfileCompleteness({
  items,
  completionPercentage,
  completedSections,
  totalSections,
}: ProviderProfileCompletenessProps) {
  // Use API data if provided, otherwise calculate from items
  const completedCount = completedSections ?? items.filter(item => item.completed).length;
  const totalCount = totalSections ?? items.length;
  // Handle edge case of empty items (0/0 = NaN)
  const percentage = completionPercentage ?? (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  const requiredItems = items.filter(item => item.required);
  const requiredCompleted = requiredItems.filter(item => item.completed).length;
  const allRequiredComplete = requiredItems.length === 0 || requiredCompleted === requiredItems.length;

  // Color based on completion percentage
  const getProgressColor = () => {
    if (percentage >= 80) return "bg-green-600";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusMessage = () => {
    if (percentage === 100) {
      return { text: "Excellent! Your profile is complete", color: "text-green-700", icon: "🎉" };
    } else if (percentage >= 80) {
      return { text: "Great! Your profile is nearly complete", color: "text-green-700", icon: "✨" };
    } else if (percentage >= 60) {
      return { text: "Good progress! Keep going", color: "text-yellow-700", icon: "📈" };
    } else if (percentage >= 40) {
      return { text: "You're making progress", color: "text-orange-700", icon: "🔨" };
    } else {
      return { text: "Let's build your profile", color: "text-red-700", icon: "🚀" };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Strength</h3>
        <span className="text-2xl" role="img" aria-label="status">
          {status.icon}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-sm text-gray-600">
            {completedCount}/{totalCount} sections
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className={`text-sm ${status.color} mt-2 font-medium`}>
          {status.text}
        </p>
      </div>

      {/* Required vs Optional */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Required sections</span>
          <span className={`text-sm font-semibold ${allRequiredComplete ? 'text-green-600' : 'text-orange-600'}`}>
            {requiredCompleted}/{requiredItems.length}
            {allRequiredComplete && (
              <svg className="inline w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Checklist</h4>
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 text-sm transition-opacity ${
              item.completed ? 'opacity-60' : 'opacity-100'
            }`}
          >
            <span className={`flex-shrink-0 mt-0.5 ${item.completed ? 'text-green-600' : 'text-gray-400'}`}>
              {item.completed ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </span>
            <span className={item.completed ? 'text-gray-600 line-through' : 'text-gray-900'}>
              {item.label}
              {item.required && !item.completed && (
                <span className="text-red-500 ml-1 text-xs font-semibold">*Required</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-blue-900 mb-1">
                Why complete your profile?
              </p>
              <p className="text-xs text-blue-800">
                {percentage < 60 ? (
                  "Complete profiles get 3x more family inquiries. Add photos, pricing, and amenities to stand out!"
                ) : percentage < 80 ? (
                  "You're almost there! Complete profiles build trust and get more bookings."
                ) : (
                  "Outstanding! Your complete profile makes a great first impression."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
