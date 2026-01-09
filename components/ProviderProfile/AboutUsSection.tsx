"use client";

export interface AboutUsData {
  // Facility History
  establishedYear: string;
  facilityHistory: string;

  // Mission Statement
  missionStatement: string;

  // What Makes Us Unique
  whatMakesUsUnique: string;
}

interface AboutUsSectionProps {
  data: AboutUsData;
  onChange: (data: AboutUsData) => void;
}

export default function AboutUsSection({
  data,
  onChange,
}: AboutUsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Facility History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Facility History
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Share your facility&apos;s story and background to help families understand your experience and heritage.
        </p>

        <div className="mb-4">
          <label
            htmlFor="established-year"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            📅 Year Established
          </label>
          <input
            type="text"
            id="established-year"
            value={data.establishedYear}
            onChange={(e) =>
              onChange({ ...data, establishedYear: e.target.value })
            }
            placeholder="e.g., 1995"
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="facility-history"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            📖 Our Story
          </label>
          <textarea
            id="facility-history"
            value={data.facilityHistory}
            onChange={(e) =>
              onChange({ ...data, facilityHistory: e.target.value })
            }
            placeholder="Example: Founded in 1995 by registered nurse Sarah Johnson, Sunrise Senior Living began as a small 20-bed facility with a vision to provide compassionate, personalized care. Over the past 30 years, we've grown to serve over 100 residents while maintaining our commitment to treating each person as family. Our founder's dedication to dignity and respect continues to guide our care philosophy today."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Include founding story, growth journey, and key milestones (300-500 words recommended).
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Mission Statement
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Articulate your core purpose and values. What drives your commitment to senior care?
        </p>
        <textarea
          id="mission-statement"
          value={data.missionStatement}
          onChange={(e) =>
            onChange({ ...data, missionStatement: e.target.value })
          }
          placeholder="Example: Our mission is to enhance the quality of life for seniors by providing compassionate, personalized care in a warm, homelike environment. We honor each resident's dignity, independence, and individuality while delivering exceptional service that exceeds expectations."
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Keep it clear and heartfelt (2-3 sentences recommended). What are your core values?
        </p>
      </div>

      {/* What Makes Us Unique */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What Makes Us Unique
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          What sets you apart from other care facilities? Highlight your distinctive features, programs, or approach.
        </p>
        <textarea
          id="what-makes-us-unique"
          value={data.whatMakesUsUnique}
          onChange={(e) =>
            onChange({ ...data, whatMakesUsUnique: e.target.value })
          }
          placeholder="Example: What sets us apart is our innovative intergenerational program partnering with a local preschool, bringing joy and purpose to our residents weekly. Our chef-prepared meals feature garden-to-table ingredients from our own vegetable garden that residents help maintain. We also offer the only dedicated art therapy studio in the region, staffed by a certified art therapist. With a 1:4 staff-to-resident ratio—well above industry standards—we deliver truly personalized attention."
          rows={7}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Be specific! Mention unique programs, exceptional ratios, special partnerships, awards, or innovative approaches (200-400 words).
        </p>
      </div>

      {/* Summary */}
      {(data.establishedYear ||
        data.facilityHistory ||
        data.missionStatement ||
        data.whatMakesUsUnique) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                About Us Summary
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                {data.establishedYear && (
                  <p>• Established: {data.establishedYear}</p>
                )}
                {data.facilityHistory && (
                  <p>
                    • Facility history: {data.facilityHistory.length} characters
                  </p>
                )}
                {data.missionStatement && (
                  <p>
                    • Mission statement: {data.missionStatement.length}{" "}
                    characters
                  </p>
                )}
                {data.whatMakesUsUnique && (
                  <p>
                    • Unique features: {data.whatMakesUsUnique.length}{" "}
                    characters
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
