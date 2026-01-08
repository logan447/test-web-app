"use client";

interface BudgetTimelineData {
  budgetMin?: number;
  budgetMax?: number;
  budgetFlexibility?: string;
  paymentMethods?: string[];
  budgetIncludes?: string;
  financialAssistanceNeeded?: string;
  careUrgency?: string;
  preferredStartDate?: string;
  careDuration?: string;
  scheduleFlexibility?: string;
}

interface BudgetTimelineProps {
  data: BudgetTimelineData;
  onDataChange: (field: keyof BudgetTimelineData, value: any) => void;
}

export default function BudgetTimeline({
  data,
  onDataChange,
}: BudgetTimelineProps) {
  const budgetFlexibilityOptions = [
    {
      value: "firm",
      label: "Firm Budget",
      description: "Cannot exceed this amount",
    },
    {
      value: "somewhat-flexible",
      label: "Somewhat Flexible",
      description: "Could adjust for the right fit",
    },
    {
      value: "very-flexible",
      label: "Very Flexible",
      description: "Open to various price points",
    },
  ];

  const paymentMethodOptions = [
    { value: "private-pay", label: "Private Pay (Out of Pocket)" },
    { value: "long-term-care-insurance", label: "Long-Term Care Insurance" },
    { value: "medicare", label: "Medicare" },
    { value: "medicaid", label: "Medicaid" },
    { value: "veterans-benefits", label: "Veterans Benefits (VA)" },
    { value: "life-insurance", label: "Life Insurance Policy" },
    { value: "reverse-mortgage", label: "Reverse Mortgage" },
    { value: "health-savings-account", label: "Health Savings Account (HSA)" },
    { value: "unsure", label: "Unsure / Need Guidance" },
  ];

  const urgencyLevels = [
    {
      value: "immediate",
      label: "Immediate (Within 24-48 hours)",
      icon: "🚨",
    },
    {
      value: "urgent",
      label: "Urgent (Within 1 week)",
      icon: "⚡",
    },
    {
      value: "soon",
      label: "Soon (Within 2-4 weeks)",
      icon: "📅",
    },
    {
      value: "planning",
      label: "Planning Ahead (1-3 months)",
      icon: "🗓️",
    },
    {
      value: "exploring",
      label: "Just Exploring Options (3+ months)",
      icon: "🔍",
    },
  ];

  const careDurationOptions = [
    {
      value: "short-term",
      label: "Short-Term",
      description: "Weeks to a few months (e.g., post-surgery recovery)",
    },
    {
      value: "medium-term",
      label: "Medium-Term",
      description: "Several months to a year",
    },
    {
      value: "long-term",
      label: "Long-Term / Permanent",
      description: "Ongoing, indefinite care",
    },
    {
      value: "respite",
      label: "Respite Care",
      description: "Temporary care to give family caregivers a break",
    },
    {
      value: "unsure",
      label: "Unsure",
      description: "Depends on how care goes",
    },
  ];

  const handlePaymentMethodToggle = (value: string) => {
    const currentMethods = data.paymentMethods || [];

    if (currentMethods.includes(value)) {
      const updated = currentMethods.filter((m) => m !== value);
      onDataChange("paymentMethods", updated);
    } else {
      onDataChange("paymentMethods", [...currentMethods, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Budget & Timeline
        </h2>
        <p className="text-sm text-gray-600">
          Help us understand your budget and timeline so we can match you with
          providers that fit your financial situation and timing needs.
        </p>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Monthly Budget Range
          <span className="text-gray-500 font-normal ml-1">
            (What can you spend per month?)
          </span>
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Minimum per month
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={data.budgetMin || ""}
                onChange={(e) =>
                  onDataChange(
                    "budgetMin",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="2,000"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Maximum per month
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={data.budgetMax || ""}
                onChange={(e) =>
                  onDataChange(
                    "budgetMax",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="5,000"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Average costs: Home care $3,000-7,000/month, Assisted living
          $4,000-8,000/month, Memory care $5,000-10,000/month
        </p>
      </div>

      {/* Budget Flexibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Budget Flexibility
        </label>
        <div className="space-y-3">
          {budgetFlexibilityOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.budgetFlexibility === option.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="budgetFlexibility"
                value={option.value}
                checked={data.budgetFlexibility === option.value}
                onChange={(e) =>
                  onDataChange("budgetFlexibility", e.target.value)
                }
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How Will You Pay for Care?
          <span className="text-gray-500 font-normal ml-1">
            (Select all that apply)
          </span>
        </label>
        <p className="text-xs text-gray-600 mb-3">
          Understanding your payment options helps us match you with providers
          who accept your payment methods
        </p>
        <div className="space-y-2">
          {paymentMethodOptions.map((method) => (
            <label
              key={method.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                data.paymentMethods?.includes(method.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.paymentMethods?.includes(method.value) || false}
                onChange={() => handlePaymentMethodToggle(method.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                {method.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* What Budget Includes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What Does Your Budget Need to Cover? (Optional)
        </label>
        <textarea
          value={data.budgetIncludes || ""}
          onChange={(e) => onDataChange("budgetIncludes", e.target.value)}
          rows={3}
          placeholder="e.g., 'Just care services' or 'Room, board, and all care' or 'Need to include medications and medical supplies'"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
      </div>

      {/* Financial Assistance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Do You Need Help Finding Financial Assistance Options? (Optional)
        </label>
        <select
          value={data.financialAssistanceNeeded || ""}
          onChange={(e) =>
            onDataChange("financialAssistanceNeeded", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select an option</option>
          <option value="yes">
            Yes, I need help finding financial assistance
          </option>
          <option value="maybe">Maybe, I&apos;d like to learn about options</option>
          <option value="no">No, I have funding figured out</option>
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Timeline Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Timeline & Urgency
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          When do you need care to start? This helps us prioritize your needs.
        </p>

        {/* Urgency Level */}
        <div className="space-y-3">
          {urgencyLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.careUrgency === level.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="careUrgency"
                value={level.value}
                checked={data.careUrgency === level.value}
                onChange={(e) => onDataChange("careUrgency", e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-2xl">{level.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {level.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Preferred Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Start Date (Optional)
        </label>
        <input
          type="date"
          value={data.preferredStartDate || ""}
          onChange={(e) => onDataChange("preferredStartDate", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          If you have a specific date in mind, let us know
        </p>
      </div>

      {/* Care Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Expected Duration of Care
        </label>
        <div className="space-y-3">
          {careDurationOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.careDuration === option.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="careDuration"
                value={option.value}
                checked={data.careDuration === option.value}
                onChange={(e) => onDataChange("careDuration", e.target.value)}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Schedule Flexibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schedule Flexibility (Optional)
        </label>
        <textarea
          value={data.scheduleFlexibility || ""}
          onChange={(e) => onDataChange("scheduleFlexibility", e.target.value)}
          rows={3}
          placeholder="Any specific timing needs or constraints? (e.g., 'Need care to start after we sell current home' or 'Must coordinate with hospital discharge' or 'Flexible on exact date')"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-green-900">
              <span className="font-semibold">
                Budget and timeline transparency helps everyone:
              </span>{" "}
              Clear information about your budget and timeline allows providers to
              give you accurate pricing and availability. Many providers also offer
              payment plans or can help you explore financial assistance options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
