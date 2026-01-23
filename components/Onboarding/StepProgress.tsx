"use client";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  variant?: "dots" | "numbered" | "detailed";
  className?: string;
}

/**
 * StepProgress - Visual progress indicator for multi-step flows
 *
 * Variants:
 * - dots: Simple dots (default)
 * - numbered: Numbered circles with labels
 * - detailed: Full step details with descriptions
 */
export default function StepProgress({
  steps,
  currentStep,
  variant = "dots",
  className = "",
}: StepProgressProps) {
  if (variant === "dots") {
    return (
      <div className={`flex justify-center gap-2 ${className}`}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index < currentStep
                ? "bg-primary-600"
                : index === currentStep
                ? "bg-primary-600 w-6"
                : "bg-gray-300"
            }`}
            title={step.label}
          />
        ))}
      </div>
    );
  }

  if (variant === "numbered") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  index < currentStep
                    ? "bg-primary-600 text-white"
                    : index === currentStep
                    ? "bg-primary-600 text-white ring-4 ring-primary-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs mt-1 max-w-[80px] text-center truncate ${
                  index <= currentStep ? "text-primary-600 font-medium" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                  index < currentStep ? "bg-primary-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div
            key={step.id}
            className={`flex gap-4 ${isPending ? "opacity-50" : ""}`}
          >
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isComplete
                    ? "bg-primary-600 text-white"
                    : isCurrent
                    ? "bg-primary-600 text-white ring-4 ring-primary-100"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                }`}
              >
                {isComplete ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-2 transition-all duration-300 ${
                    isComplete ? "bg-primary-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-8">
              <h4
                className={`font-semibold ${
                  isCurrent ? "text-primary-600" : isComplete ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.label}
              </h4>
              {step.description && (
                <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
              )}
              {isCurrent && (
                <div className="mt-2 flex items-center gap-2 text-xs text-primary-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
                  </span>
                  In progress
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Predefined step configurations for common onboarding flows
 */
export const FAMILY_ONBOARDING_STEPS: Step[] = [
  { id: "intent", label: "Welcome", description: "Tell us who you are" },
  { id: "details", label: "Care Details", description: "About your care needs" },
  { id: "visibility", label: "Privacy", description: "Control your profile visibility" },
  { id: "complete", label: "Complete", description: "Start browsing providers" },
];

export const PROVIDER_ONBOARDING_STEPS: Step[] = [
  { id: "intent", label: "Welcome", description: "Tell us who you are" },
  { id: "type", label: "Provider Type", description: "Organization or individual" },
  { id: "details", label: "Your Profile", description: "Basic information" },
  { id: "visibility", label: "Visibility", description: "Who can see your profile" },
  { id: "complete", label: "Complete", description: "Start connecting with families" },
];
