"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  count,
  countLabel = "results",
  breadcrumbs,
  showBackButton = false,
  backHref = "/browse",
  backLabel = "Go back",
  actions,
  className = "",
}: PageHeaderProps) {
  // Build the title with count if provided
  const displayTitle = count !== undefined
    ? `${count} ${countLabel}`
    : title;

  return (
    <div className={`border-b border-gray-200 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Back Button and Breadcrumbs Row */}
        {(showBackButton || (breadcrumbs && breadcrumbs.length > 0)) && (
          <div className="flex items-center gap-4 mb-3">
            {showBackButton && (
              <Link
                href={backHref}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {backLabel}
              </Link>
            )}

            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-2">
                    {index > 0 && <span className="text-gray-400">›</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-primary-600 hover:underline">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Title Row */}
        {(displayTitle || actions) && (
          <div className="flex items-center justify-between">
            <div>
              {displayTitle && (
                <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
