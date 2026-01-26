"use client";

import { ProviderType } from "@prisma/client";
import {
  getContactVisibility,
  canViewProviderContact,
  ViewerRole,
  EngagementStatus,
  getSubjectTypeFromProviderType,
  canShowAnyContactInfo,
} from "@/lib/contactVisibility";

interface ContactInfoDisplayProps {
  // Contact data
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;

  // Visibility rules
  providerType: ProviderType;
  viewerRole: ViewerRole;
  engagementStatus?: EngagementStatus | null;
  context?: "profile_page" | "card" | "engagement_page";

  // Display options
  layout?: "horizontal" | "vertical" | "compact";
  showLabels?: boolean;
  showIcons?: boolean;
  className?: string;

  // Callbacks
  onContactClick?: (type: "phone" | "email" | "website") => void;
}

// Icons for contact types
const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const WebsiteIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export default function ContactInfoDisplay({
  phone,
  email,
  website,
  address,
  providerType,
  viewerRole,
  engagementStatus,
  context = "profile_page",
  layout = "vertical",
  showLabels = true,
  showIcons = true,
  className = "",
  onContactClick,
}: ContactInfoDisplayProps) {
  // Get visibility rules
  const visibility = canViewProviderContact(
    providerType,
    viewerRole,
    engagementStatus,
    context
  );

  // Check if there's any contact info to show
  const hasAnyData = phone || email || website || address;
  const canShowAny = canShowAnyContactInfo(visibility);

  // If no data at all, show nothing
  if (!hasAnyData) {
    return null;
  }

  // If user can't see any contact info, show the locked state
  if (!canShowAny) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
          <LockIcon />
          <span className="text-sm">{visibility.reason}</span>
        </div>
      </div>
    );
  }

  // Build the contact items to display
  const contactItems: Array<{
    type: "phone" | "email" | "website" | "address";
    value: string;
    href?: string;
    icon: React.ReactNode;
    label: string;
  }> = [];

  if (phone && visibility.canShowPhone) {
    contactItems.push({
      type: "phone",
      value: phone,
      href: `tel:${phone}`,
      icon: <PhoneIcon />,
      label: "Phone",
    });
  }

  if (email && visibility.canShowEmail) {
    contactItems.push({
      type: "email",
      value: email,
      href: `mailto:${email}`,
      icon: <EmailIcon />,
      label: "Email",
    });
  }

  if (website && visibility.canShowWebsite) {
    const websiteUrl = website.startsWith("http") ? website : `https://${website}`;
    contactItems.push({
      type: "website",
      value: website.replace(/^https?:\/\//, ""),
      href: websiteUrl,
      icon: <WebsiteIcon />,
      label: "Website",
    });
  }

  if (address && visibility.canShowAddress) {
    contactItems.push({
      type: "address",
      value: address,
      href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      icon: <LocationIcon />,
      label: "Address",
    });
  }

  // If no items to show, return null
  if (contactItems.length === 0) {
    return null;
  }

  // Layout styles
  const layoutStyles = {
    horizontal: "flex flex-wrap items-center gap-4",
    vertical: "flex flex-col gap-2",
    compact: "flex flex-wrap items-center gap-3 text-sm",
  };

  return (
    <div className={`${layoutStyles[layout]} ${className}`}>
      {contactItems.map((item) => (
        <a
          key={item.type}
          href={item.href}
          target={item.type === "website" || item.type === "address" ? "_blank" : undefined}
          rel={item.type === "website" || item.type === "address" ? "noopener noreferrer" : undefined}
          onClick={(e) => {
            if (onContactClick) {
              onContactClick(item.type as "phone" | "email" | "website");
            }
          }}
          className={`
            flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors
            ${layout === "compact" ? "text-sm" : ""}
          `}
        >
          {showIcons && (
            <span className="text-gray-400 group-hover:text-primary-500">
              {item.icon}
            </span>
          )}
          <span className="flex flex-col">
            {showLabels && layout !== "compact" && (
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {item.label}
              </span>
            )}
            <span className={layout === "compact" ? "" : "font-medium"}>
              {item.value}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

/**
 * Compact version for cards - shows icons only with tooltips
 */
export function ContactInfoIcons({
  phone,
  email,
  website,
  providerType,
  viewerRole,
  engagementStatus,
  context = "card",
  className = "",
}: Omit<ContactInfoDisplayProps, "layout" | "showLabels" | "showIcons" | "address">) {
  const visibility = canViewProviderContact(
    providerType,
    viewerRole,
    engagementStatus,
    context
  );

  const canShowAny = canShowAnyContactInfo(visibility);

  if (!canShowAny) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {phone && visibility.canShowPhone && (
        <a
          href={`tel:${phone}`}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          title={phone}
        >
          <PhoneIcon />
        </a>
      )}
      {email && visibility.canShowEmail && (
        <a
          href={`mailto:${email}`}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          title={email}
        >
          <EmailIcon />
        </a>
      )}
      {website && visibility.canShowWebsite && (
        <a
          href={website.startsWith("http") ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          title={website}
        >
          <WebsiteIcon />
        </a>
      )}
    </div>
  );
}

/**
 * Helper component that shows the reason why contact is hidden
 */
export function ContactHiddenMessage({
  providerType,
  viewerRole,
  engagementStatus,
  context = "profile_page",
  className = "",
}: Omit<ContactInfoDisplayProps, "phone" | "email" | "website" | "address" | "layout" | "showLabels" | "showIcons">) {
  const visibility = canViewProviderContact(
    providerType,
    viewerRole,
    engagementStatus,
    context
  );

  if (canShowAnyContactInfo(visibility)) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-gray-500 text-sm ${className}`}>
      <LockIcon />
      <span>{visibility.reason}</span>
    </div>
  );
}
