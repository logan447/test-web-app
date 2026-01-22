"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/Auth/AuthModal";
import SignOutModal from "@/components/Auth/SignOutModal";
import { showToast } from "@/lib/toast";
import { triggerOnboardingAfterSignup } from "@/components/Onboarding";

const MAIN_CATEGORIES = [
  {
    name: "Home Care",
    slug: "home-care",
    links: [
      { label: "Find Home Care Service", href: "/home-care/find-service" },
      { label: "Paying for Home Care", href: "/home-care/paying" },
      { label: "What's the difference?", href: "/home-care/difference" },
      { label: "Questions About Home Care", href: "/home-care/questions" },
      { label: "Home Care Education Hub", href: "/home-care/education" },
    ],
  },
  {
    name: "Assisted Living",
    slug: "assisted-living",
    links: [
      { label: "Find Assisted Living Facilities", href: "/assisted-living/find-facilities" },
      { label: "Paying for Assisted Living", href: "/assisted-living/paying" },
      { label: "How to Choose a Facility", href: "/assisted-living/how-to-choose" },
      { label: "Questions About Assisted Living", href: "/assisted-living/questions" },
      { label: "Assisted Living Education Hub", href: "/assisted-living/education" },
    ],
  },
  {
    name: "Memory Care",
    slug: "memory-care",
    links: [
      { label: "Find Memory Care Facilities", href: "/memory-care/find-facilities" },
      { label: "Paying for Memory Care", href: "/memory-care/paying" },
      { label: "What is Memory Care?", href: "/memory-care/what-is" },
      { label: "Questions About Memory Care", href: "/memory-care/questions" },
      { label: "Memory Care Education Hub", href: "/memory-care/education" },
    ],
  },
  {
    name: "Nursing Home",
    slug: "nursing-home",
    links: [
      { label: "Find Nursing Homes", href: "/nursing-home/find-facilities" },
      { label: "Paying for Nursing Home", href: "/nursing-home/paying" },
      { label: "Nursing Home vs Assisted Living", href: "/nursing-home/comparison" },
      { label: "Questions About Nursing Homes", href: "/nursing-home/questions" },
      { label: "Nursing Home Education Hub", href: "/nursing-home/education" },
    ],
  },
];

const OTHER_CATEGORIES = [
  {
    name: "Independent",
    slug: "independent-living",
    links: [
      { label: "Find Independent Living", href: "/independent-living/find-facilities" },
      { label: "Paying for Independent Living", href: "/independent-living/paying" },
      { label: "Independent Living Benefits", href: "/independent-living/benefits" },
      { label: "Questions About Independent Living", href: "/independent-living/questions" },
      { label: "Independent Living Education Hub", href: "/independent-living/education" },
    ],
  },
  {
    name: "Hospice",
    slug: "hospice",
    links: [
      { label: "Find Hospice Care", href: "/hospice/find-service" },
      { label: "Paying for Hospice", href: "/hospice/paying" },
      { label: "What is Hospice Care?", href: "/hospice/what-is" },
      { label: "Questions About Hospice", href: "/hospice/questions" },
      { label: "Hospice Education Hub", href: "/hospice/education" },
    ],
  },
  {
    name: "Rehab",
    slug: "rehabilitation",
    links: [
      { label: "Find Rehab Facilities", href: "/rehabilitation/find-facilities" },
      { label: "Paying for Rehabilitation", href: "/rehabilitation/paying" },
      { label: "Types of Rehabilitation", href: "/rehabilitation/types" },
      { label: "Questions About Rehabilitation", href: "/rehabilitation/questions" },
      { label: "Rehabilitation Education Hub", href: "/rehabilitation/education" },
    ],
  },
];

function MainNavContent() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openOtherSubdropdown, setOpenOtherSubdropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("login");
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [providerType, setProviderType] = useState<string | null>(null);

  // Fetch provider type
  useEffect(() => {
    if (!session) return;

    const fetchProviderProfile = async () => {
      try {
        const response = await fetch('/api/providers/me');
        if (response.ok) {
          const provider = await response.json();
          setProviderType(provider.providerType);
        }
      } catch (error) {
        console.error('Error fetching provider profile:', error);
      }
    };

    fetchProviderProfile();
  }, [session]);

  // Fetch unread count
  useEffect(() => {
    if (!session) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);


  // Mode switching handler - updates DB and session (Manual Ch 2)
  // Database is the single source of truth for mode
  const handleModeSwitch = async (newMode: 'FAMILY' | 'PROVIDER') => {
    if (switchingMode) return;

    setSwitchingMode(true);

    try {
      // Step 1: Update mode in database via PATCH endpoint
      const response = await fetch('/api/user/mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch mode');
      }

      const result = await response.json();

      // Step 2: Update NextAuth session/JWT with new mode
      await updateSession({ activeMode: newMode });

      // Step 3: Show success message
      showToast.success(`Switched to ${newMode === 'PROVIDER' ? 'Provider' : 'Family'} mode`);

      // Step 4: If switching to provider mode without a provider profile,
      // trigger onboarding wizard (per Manual Ch 3)
      if (newMode === 'PROVIDER' && !providerType) {
        triggerOnboardingAfterSignup('provider');
      }

      // Step 5: Navigate to landing page (soft navigation preserves session)
      router.push(result.data.landingPage);

    } catch (error) {
      console.error('MODE SWITCH ERROR:', error);
      showToast.error('Failed to switch mode. Please try again.');
    } finally {
      setSwitchingMode(false);
    }
  };

  // Read mode from session (database is source of truth per Manual Ch 2)
  const currentMode = session?.user?.activeMode || 'FAMILY';
  const isProviderMode = currentMode === 'PROVIDER';

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo - Bird mark + wordmark per Manual Ch 4 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bird-logo.svg"
                alt=""
                className="w-8 h-8"
                aria-hidden="true"
              />
              <span className="text-2xl font-bold text-gray-900">Olera</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {MAIN_CATEGORIES.map((category) => (
              <div
                key={category.slug}
                className="relative"
                onMouseEnter={() => setOpenDropdown(category.slug)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium text-sm flex items-center">
                  {category.name}
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === category.slug && (
                  <div className="absolute left-0 mt-0 w-64 bg-white shadow-lg rounded-md py-2 z-50">
                    {category.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Other Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("other")}
              onMouseLeave={() => {
                setOpenDropdown(null);
                setOpenOtherSubdropdown(null);
              }}
            >
              <button className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium text-sm flex items-center">
                Other
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === "other" && (
                <div className="absolute left-0 mt-0 w-64 bg-white shadow-lg rounded-md py-2 z-50">
                  {OTHER_CATEGORIES.map((subCategory) => (
                    <div
                      key={subCategory.slug}
                      className="relative"
                      onMouseEnter={() => setOpenOtherSubdropdown(subCategory.slug)}
                      onMouseLeave={() => setOpenOtherSubdropdown(null)}
                    >
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between">
                        {subCategory.name}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {openOtherSubdropdown === subCategory.slug && (
                        <div className="absolute left-full top-0 ml-1 w-64 bg-white shadow-lg rounded-md py-2 z-50">
                          {subCategory.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {session && (
              isProviderMode ? (
                <Link
                  href="/provider/leads"
                  className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium text-sm"
                >
                  Provider Mode
                </Link>
              ) : (
                <button
                  onClick={() => handleModeSwitch('PROVIDER')}
                  disabled={switchingMode}
                  className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium text-sm disabled:opacity-50"
                >
                  {switchingMode ? 'Switching...' : 'For Providers'}
                </button>
              )
            )}
          </div>

          {/* Right side - Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 break-words">{session.user?.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isProviderMode
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isProviderMode ? '🏢 Provider Mode' : '👥 Family Mode'}
                      </span>
                    </div>
                  </div>
                  {isProviderMode ? (
                    <>
                      {/* Provider mode - check if profile exists */}
                      {providerType ? (
                        <>
                          {/* Has provider profile */}
                          <Link href="/provider/leads" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Leads
                          </Link>
                          <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <span className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Requests
                            </span>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link href="/provider/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                          </Link>

                          {/* Hiring section divider */}
                          <div className="border-t border-gray-200 my-1"></div>

                          {/* Hiring section - different for organizations vs caregivers */}
                          {providerType === 'INDEPENDENT_CAREGIVER' ? (
                            <>
                              <Link href="/provider/organizations" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Find Organizations
                              </Link>
                              <Link href="/provider/opportunities" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                My Opportunities
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/provider/hire-staff" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Hire Care Staff
                              </Link>
                              <Link href="/provider/candidates" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                My Candidates
                              </Link>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {/* No provider profile - show navigation with onboarding prompt */}
                          <Link href="/provider/leads" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Leads
                          </Link>
                          <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <span className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Requests
                            </span>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link href="/provider/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            My Profile
                          </Link>
                          {/* Secondary provider nav */}
                          <div className="border-t border-gray-200 my-1"></div>
                          <Link href="/provider/hire-staff" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Hire Care Staff
                          </Link>
                          <button
                            onClick={() => triggerOnboardingAfterSignup('provider')}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-gray-100 font-medium"
                          >
                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Become a Caregiver
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Family mode */}
                      <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse Providers
                      </Link>
                      <Link href="/saved" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Saved Providers
                      </Link>
                      <Link href="/requests" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          My Providers
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/matches" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Matches
                      </Link>
                      <Link href="/care-profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Care Profile
                      </Link>
                      <Link href="/benefits" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Benefits
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-200 mt-1 pt-1">
                    {isProviderMode ? (
                      <button
                        onClick={() => handleModeSwitch('FAMILY')}
                        disabled={switchingMode}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {switchingMode ? 'Switching...' : 'Switch to Family Mode'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModeSwitch('PROVIDER')}
                        disabled={switchingMode}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {switchingMode ? 'Switching...' : 'Switch to Provider Mode'}
                      </button>
                    )}
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => setSignOutModalOpen(true)}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/for-providers"
                  className="text-gray-700 hover:text-primary-600 font-medium text-sm"
                >
                  For Providers
                </Link>
                <button
                  onClick={() => {
                    setAuthModalView("login");
                    setAuthModalOpen(true);
                  }}
                  className="text-gray-700 hover:text-primary-600 font-medium text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalView("signup");
                    setAuthModalOpen(true);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium text-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4">
            {MAIN_CATEGORIES.map((category) => (
              <div key={category.slug} className="py-2">
                <button
                  onClick={() => setOpenDropdown(openDropdown === category.slug ? null : category.slug)}
                  className="w-full text-left px-3 py-2 text-gray-700 font-medium flex justify-between items-center"
                >
                  {category.name}
                  <svg
                    className={`w-4 h-4 transform transition-transform ${openDropdown === category.slug ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openDropdown === category.slug && (
                  <div className="pl-6">
                    {category.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-primary-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Other Dropdown for Mobile */}
            <div className="py-2">
              <button
                onClick={() => setOpenDropdown(openDropdown === "other" ? null : "other")}
                className="w-full text-left px-3 py-2 text-gray-700 font-medium flex justify-between items-center"
              >
                Other
                <svg
                  className={`w-4 h-4 transform transition-transform ${openDropdown === "other" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === "other" && (
                <div className="pl-6">
                  {OTHER_CATEGORIES.map((subCategory) => (
                    <div key={subCategory.slug}>
                      <button
                        onClick={() => setOpenOtherSubdropdown(openOtherSubdropdown === subCategory.slug ? null : subCategory.slug)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary-600 flex justify-between items-center"
                      >
                        {subCategory.name}
                        <svg
                          className={`w-4 h-4 transform transition-transform ${openOtherSubdropdown === subCategory.slug ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openOtherSubdropdown === subCategory.slug && (
                        <div className="pl-6">
                          {subCategory.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="block px-3 py-2 text-xs text-gray-600 hover:text-primary-600"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {session ? (
              isProviderMode ? (
                <Link
                  href="/provider/leads"
                  className="block px-3 py-2 text-gray-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Provider Mode
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleModeSwitch('PROVIDER');
                    setMobileMenuOpen(false);
                  }}
                  disabled={switchingMode}
                  className="block w-full text-left px-3 py-2 text-gray-700 font-medium disabled:opacity-50"
                >
                  {switchingMode ? 'Switching...' : 'For Providers'}
                </button>
              )
            ) : (
              <Link href="/for-providers" className="block px-3 py-2 text-gray-700 font-medium">
                For Providers
              </Link>
            )}

            <div className="border-t mt-4 pt-4">
              {session ? (
                <>
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isProviderMode
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isProviderMode ? '🏢 Provider Mode' : '👥 Family Mode'}
                      </span>
                    </div>
                  </div>
                  {isProviderMode ? (
                    <>
                      {/* Provider mode - check if profile exists */}
                      {providerType ? (
                        <>
                          {/* Has provider profile */}
                          <Link href="/provider/leads" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            Leads
                          </Link>
                          <Link href="/provider/requests" className="flex items-center justify-between px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            <span>Requests</span>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link href="/provider/profile" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            My Profile
                          </Link>

                          {/* Hiring section divider */}
                          <div className="border-t border-gray-200 my-2"></div>

                          {/* Hiring section - different for organizations vs caregivers */}
                          {providerType === 'INDEPENDENT_CAREGIVER' ? (
                            <>
                              <Link href="/provider/organizations" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                Find Organizations
                              </Link>
                              <Link href="/provider/opportunities" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                My Opportunities
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/provider/hire-staff" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                Hire Care Staff
                              </Link>
                              <Link href="/provider/candidates" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                My Candidates
                              </Link>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {/* No provider profile - show navigation with onboarding prompt */}
                          <Link href="/provider/leads" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            Leads
                          </Link>
                          <Link href="/provider/requests" className="flex items-center justify-between px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            <span>Requests</span>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link href="/provider/profile" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            My Profile
                          </Link>
                          {/* Secondary provider nav */}
                          <div className="border-t border-gray-200 my-2"></div>
                          <Link href="/provider/hire-staff" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            Hire Care Staff
                          </Link>
                          <button
                            onClick={() => {
                              triggerOnboardingAfterSignup('provider');
                              setMobileMenuOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 text-primary-600 font-medium"
                          >
                            Become a Caregiver
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Family mode */}
                      <Link href="/" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Browse Providers
                      </Link>
                      <Link href="/saved" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Saved Providers
                      </Link>
                      <Link href="/requests" className="flex items-center justify-between px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        <span>My Providers</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/matches" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Matches
                      </Link>
                      <Link href="/care-profile" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        My Care Profile
                      </Link>
                      <Link href="/benefits" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Benefits
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-200 my-2"></div>
                  {isProviderMode ? (
                    <button
                      onClick={() => {
                        handleModeSwitch('FAMILY');
                        setMobileMenuOpen(false);
                      }}
                      disabled={switchingMode}
                      className="block w-full text-left px-3 py-2 text-gray-700 disabled:opacity-50"
                    >
                      {switchingMode ? 'Switching...' : 'Switch to Family Mode'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleModeSwitch('PROVIDER');
                        setMobileMenuOpen(false);
                      }}
                      disabled={switchingMode}
                      className="block w-full text-left px-3 py-2 text-gray-700 disabled:opacity-50"
                    >
                      {switchingMode ? 'Switching...' : 'Switch to Provider Mode'}
                    </button>
                  )}
                  <Link href="/settings" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                    Settings
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => setSignOutModalOpen(true)}
                    className="block w-full text-left px-3 py-2 text-gray-700"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthModalView("login");
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalView("signup");
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2 bg-primary-600 text-white rounded-md text-center"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultView={authModalView}
      />

      {/* Sign Out Modal */}
      <SignOutModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
      />
    </nav>
  );
}

// Export component directly
export default MainNavContent;
