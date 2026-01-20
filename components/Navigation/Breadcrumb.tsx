"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Route segment to display label mapping
const SEGMENT_LABELS: Record<string, string> = {
  // Dashboard routes
  dashboard: "Dashboard",
  requests: "My Providers",
  "my-providers": "My Providers",
  saved: "Saved",
  "care-profile": "Care Profile",
  "care-profiles": "Care Profiles",
  "provider-profile": "Provider Profile",
  settings: "Settings",

  // Provider routes
  provider: "Provider",
  hire: "Hire",
  "hire-staff": "Hire Staff",
  "hiring-requests": "Hiring Requests",
  onboarding: "Onboarding",

  // Care type routes
  "home-care": "Home Care",
  "assisted-living": "Assisted Living",
  "memory-care": "Memory Care",
  "nursing-home": "Nursing Home",
  "independent-living": "Independent Living",
  hospice: "Hospice",
  rehabilitation: "Rehabilitation",

  // Provider directory
  providers: "Providers",

  // Caregiver routes
  caregiver: "Caregiver",
  "browse-organizations": "Browse Organizations",

  // Common
  new: "New",
  edit: "Edit",
};

// Routes that should not show breadcrumbs
const HIDDEN_ROUTES = ["/", "/login", "/signup", "/for-providers"];

// Redundant segment combinations to skip (when parent + child represent same level)
// Format: { parent: child[] } - skip the parent when followed by any of these children
const REDUNDANT_SEGMENTS: Record<string, string[]> = {
  provider: ["dashboard"], // /provider/dashboard -> skip "provider", show "Dashboard" as "Provider Dashboard"
  dashboard: ["provider-profile"], // /dashboard/provider-profile -> skip "dashboard" as redundant
};

// Build breadcrumb items from pathname
function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Don't show breadcrumbs on certain routes
  if (HIDDEN_ROUTES.includes(pathname)) {
    return [];
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Check for redundant segment combinations
    const nextSegment = segments[i + 1];
    if (nextSegment && REDUNDANT_SEGMENTS[segment]?.includes(nextSegment)) {
      // Skip this segment as it's redundant with the next one
      continue;
    }

    // IMPORTANT: Known segments should NEVER be skipped
    // Only skip segments that look like IDs and are NOT in our label mapping
    const isKnownSegment = !!SEGMENT_LABELS[segment];

    if (!isKnownSegment) {
      // Skip ID-like segments (detail pages) - they'll be handled by the page via currentPage prop
      const isUUID = segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      const isCUID = segment.match(/^c[a-z0-9]{7,}$/i) || segment.match(/^[a-z0-9]{8,}$/i);
      const isAlphanumericId = segment.match(/^[a-zA-Z0-9]{6,}$/);

      if (isUUID || isCUID || isAlphanumericId) {
        continue;
      }
    }

    // Check if previous segment was skipped due to redundancy - use combined label
    const prevSegment = segments[i - 1];
    let label: string;
    if (prevSegment && REDUNDANT_SEGMENTS[prevSegment]?.includes(segment)) {
      // Use a combined label for clarity (e.g., "Provider Dashboard" instead of just "Dashboard")
      const prevLabel = SEGMENT_LABELS[prevSegment] || prevSegment;
      const currentLabel = SEGMENT_LABELS[segment] || segment;
      label = `${prevLabel} ${currentLabel}`;
    } else {
      // Get label from mapping or capitalize the segment
      label = SEGMENT_LABELS[segment] || segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

interface BreadcrumbProps {
  // Optional custom items to override auto-generation
  items?: BreadcrumbItem[];
  // Optional current page label (for detail pages with dynamic titles)
  currentPage?: string;
  // Optional className for custom styling
  className?: string;
}

export default function Breadcrumb({ items, currentPage, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  // Use provided items or auto-generate from pathname
  const breadcrumbs = items || buildBreadcrumbs(pathname);

  // Add current page if provided (for detail pages)
  if (currentPage && breadcrumbs.length > 0) {
    breadcrumbs.push({
      label: currentPage,
      href: pathname,
    });
  }

  // Don't render if no breadcrumbs or only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`bg-gray-100 border-b border-gray-200 ${className}`}>
      <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 mx-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
