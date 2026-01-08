"use client";

interface WarmIntroductionProps {
  currentStep: number;
  stepTitle: string;
  stepDescription: string;
}

export default function WarmIntroduction({
  currentStep,
  stepTitle,
  stepDescription,
}: WarmIntroductionProps) {
  return (
    <div className="mb-8 animate-fade-in">
      {/* Main Headline - Only on Step 1 */}
      {currentStep === 1 && (
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tell Us About Your Loved One
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The more we know, the better we can help you find the perfect match.
            This information helps care providers understand your needs and provide
            personalized care.
          </p>
        </div>
      )}

      {/* Step-Specific Intro */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 mb-6 border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {stepTitle}
            </h2>
            <p className="text-gray-700 leading-relaxed">{stepDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
