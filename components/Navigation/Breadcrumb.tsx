"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

// Route segment to display label mapping
// Labels should closely match URL segments (readable version of the path)
const SEGMENT_LABELS: Record<string, string> = {
  // Main sections
  dashboard: "Dashboard",
  provider: "Provider",
  providers: "Providers",
  caregiver: "Caregiver",
  settings: "Settings",
  onboarding: "Onboarding",

  // Dashboard sub-routes (Family mode)
  "my-providers": "My Providers",
  "saved-providers": "Saved Providers",
  "care-profile": "Care Profile",
  "care-profiles": "Care Profiles",
  "provider-profile": "Provider Profile",

  // Provider sub-routes
  leads: "Find Families",
  requests: "My Connections",
  profile: "Provider Profile",
  "hire-staff": "Hire Staff",
  candidates: "My Candidates",
  organizations: "Find Organizations",
  opportunities: "My Opportunities",

  // Caregiver sub-routes
  "browse-organizations": "Browse Organizations",

  // Care type routes
  "home-care": "Home Care",
  "assisted-living": "Assisted Living",
  "memory-care": "Memory Care",
  "nursing-home": "Nursing Home",
  "independent-living": "Independent Living",
  hospice: "Hospice",
  rehabilitation: "Rehabilitation",

  // Common
  new: "New",
  edit: "Edit",
  saved: "Saved Providers",
  matches: "My Matches",
  browse: "Browse",
};

// Routes that should not show breadcrumbs
const HIDDEN_ROUTES = ["/", "/login", "/signup", "/for-providers"];

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

    // Check if this is a known segment
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

    // Get label from mapping or format the segment
    const label = SEGMENT_LABELS[segment] || segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
  // Inline variant renders without background/border for embedding in page headers
  variant?: "default" | "inline";
}

export default function Breadcrumb({ items, currentPage, className = "", variant = "default" }: BreadcrumbProps) {
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

  const isInline = variant === "inline";

  return (
    <nav aria-label="Breadcrumb" className={isInline ? className : `bg-gray-100 border-b border-gray-200 ${className}`}>
      <ol className={isInline ? "flex items-center space-x-2 text-sm text-gray-500" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-2 text-sm text-gray-600"}>
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
