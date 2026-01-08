"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { number: number; title: string; completed: boolean }[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
}: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step.completed
                    ? "bg-primary-600 text-white"
                    : step.number === currentStep
                    ? "bg-primary-100 text-primary-600 ring-4 ring-primary-200"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.completed ? (
                  <svg
                    className="w-6 h-6"
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
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step Title */}
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  step.number === currentStep
                    ? "text-primary-600"
                    : step.completed
                    ? "text-gray-700"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                  step.completed ? "bg-primary-600" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Current Step Only */}
      <div className="md:hidden mb-6">
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
              {currentStep}
            </div>
            <div>
              <div className="text-sm font-semibold text-primary-900">
                {steps.find((s) => s.number === currentStep)?.title}
              </div>
              <div className="text-xs text-primary-700">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
