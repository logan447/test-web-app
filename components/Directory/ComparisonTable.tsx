"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ComparisonProvider,
  getComparisonCategories,
  getBestValue,
  formatProviderType,
  formatPriceRange,
  calculateComparisonScore,
  generateComparisonInsights,
} from "@/lib/comparisonUtils";

interface ComparisonTableProps {
  providers: ComparisonProvider[];
  onRemoveProvider?: (providerId: string) => void;
}

export default function ComparisonTable({
  providers,
  onRemoveProvider,
}: ComparisonTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "overview",
    "pricing",
    "ratings",
    "verification",
  ]);

  const categories = getComparisonCategories();
  const insights = generateComparisonInsights(providers);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderValue = (
    provider: ComparisonProvider,
    field: { id: string; getValue: (p: ComparisonProvider) => unknown; format?: (v: unknown, p?: ComparisonProvider) => string; highlight?: string },
    bestProviderId: string | null
  ) => {
    const value = field.getValue(provider);
    const isBest = bestProviderId === provider.id;

    // Handle boolean values
    if (field.highlight === "boolean") {
      const isTrue = value === true;
      return (
        <span className={`inline-flex items-center gap-1 ${isTrue ? "text-green-600" : "text-gray-400"}`}>
          {isTrue ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Yes
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              No
            </>
          )}
        </span>
      );
    }

    // Format the value
    let displayValue: string;
    if (field.format) {
      displayValue = field.format(value, provider);
    } else if (value === null || value === undefined) {
      displayValue = "Not specified";
    } else if (Array.isArray(value)) {
      displayValue = value.length > 0 ? value.join(", ") : "None";
    } else {
      displayValue = String(value);
    }

    return (
      <span className={`${isBest ? "font-semibold text-green-700" : ""}`}>
        {displayValue}
        {isBest && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Best
          </span>
        )}
      </span>
    );
  };

  if (providers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers to compare</h3>
        <p className="text-gray-600 mb-4">Select providers from your saved list to compare them side by side.</p>
        <Link
          href="/saved"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go to Saved Providers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Panel */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Quick Insights</h3>
          </div>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Provider Headers */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="sticky left-0 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48 min-w-48">
                  Attribute
                </th>
                {providers.map((provider) => (
                  <th key={provider.id} className="px-6 py-4 text-center min-w-64">
                    <div className="space-y-3">
                      {/* Provider Photo */}
                      <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-gray-100">
                        {provider.coverPhoto || provider.photos?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={provider.coverPhoto || provider.photos?.[0]}
                            alt={provider.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Provider Name */}
                      <div>
                        <Link
                          href={`/providers/${provider.id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {provider.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {formatProviderType(provider.providerType)}
                        </p>
                      </div>

                      {/* Comparison Score */}
                      <div className="flex items-center justify-center gap-1">
                        <div className="text-sm font-medium text-gray-700">
                          Score: {calculateComparisonScore(provider)}
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${calculateComparisonScore(provider)}%` }}
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      {onRemoveProvider && (
                        <button
                          onClick={() => onRemoveProvider(provider.id)}
                          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <>
                  {/* Category Header */}
                  <tr
                    key={category.id}
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <td
                      colSpan={providers.length + 1}
                      className="px-6 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${
                            expandedCategories.includes(category.id) ? "rotate-90" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-semibold text-gray-900">{category.label}</span>
                      </div>
                    </td>
                  </tr>

                  {/* Category Fields */}
                  {expandedCategories.includes(category.id) &&
                    category.fields.map((field) => {
                      const bestProviderId = getBestValue(providers, field);

                      return (
                        <tr key={field.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="sticky left-0 bg-white px-6 py-3 text-sm text-gray-600">
                            {field.label}
                          </td>
                          {providers.map((provider) => (
                            <td key={provider.id} className="px-6 py-3 text-center text-sm">
                              {renderValue(provider, field, bestProviderId)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        {providers.map((provider) => (
          <Link
            key={provider.id}
            href={`/providers/${provider.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            View {provider.name}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
