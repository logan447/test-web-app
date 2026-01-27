"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AuthModal from "@/components/Auth/AuthModal";
import SignOutModal from "@/components/Auth/SignOutModal";
import NotificationDropdown from "@/components/Navigation/NotificationDropdown";
import { showToast } from "@/lib/toast";

// Main care categories with SEO-friendly sub-links (hover dropdowns)
const MAIN_CATEGORIES = [
  {
    name: "Home Care",
    slug: "home-care",
    type: "HOME_CARE",
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
    type: "ASSISTED_LIVING",
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
    type: "MEMORY_CARE",
    links: [
      { label: "Find Memory Care Facilities", href: "/memory-care/find-facilities" },
      { label: "Paying for Memory Care", href: "/memory-care/paying" },
      { label: "What is Memory Care?", href: "/memory-care/what-is" },
      { label: "Questions About Memory Care", href: "/memory-care/questions" },
      { label: "Memory Care Education Hub", href: "/memory-care/education" },
    ],
  },
  {
    name: "Nursing Homes",
    slug: "nursing-home",
    type: "NURSING_HOME",
    links: [
      { label: "Find Nursing Homes", href: "/nursing-home/find-facilities" },
      { label: "Paying for Nursing Home", href: "/nursing-home/paying" },
      { label: "Nursing Home vs Assisted Living", href: "/nursing-home/comparison" },
      { label: "Questions About Nursing Homes", href: "/nursing-home/questions" },
      { label: "Nursing Home Education Hub", href: "/nursing-home/education" },
    ],
  },
];

// "More" care types in a hover dropdown
const OTHER_CATEGORIES = [
  {
    name: "Independent Living",
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
    name: "Hospice Care",
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
    name: "Rehabilitation",
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

interface MainNavContentProps {
  hidden?: boolean;
}

function MainNavContent({ hidden }: MainNavContentProps) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openOtherSubdropdown, setOpenOtherSubdropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("login");
  const [authIntent, setAuthIntent] = useState<"provider" | "family" | undefined>(undefined);
  const [authProviderSubtype, setAuthProviderSubtype] = useState<"organization" | "individual" | undefined>(undefined);
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
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Mode switching handler
  const handleModeSwitch = async (newMode: 'FAMILY' | 'PROVIDER') => {
    if (switchingMode) return;
    setSwitchingMode(true);

    try {
      const response = await fetch('/api/user/mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });

      if (!response.ok) throw new Error('Failed to switch mode');

      const result = await response.json();
      await updateSession({ activeMode: newMode });
      showToast.success(`Switched to ${newMode === 'PROVIDER' ? 'Provider' : 'Family'} mode`);

      if (newMode === 'PROVIDER' && !providerType) {
        router.push('/provider/leads?onboarding=true&intent=provider');
        return;
      }

      router.push(result.data.landingPage);
    } catch (error) {
      console.error('MODE SWITCH ERROR:', error);
      showToast.error('Failed to switch mode. Please try again.');
    } finally {
      setSwitchingMode(false);
    }
  };

  const currentMode = session?.user?.activeMode || 'FAMILY';
  const isProviderMode = currentMode === 'PROVIDER';

  const triggerProviderOnboarding = (subtype?: 'individual' | 'organization') => {
    setAuthIntent("provider");
    setAuthProviderSubtype(subtype);
    setAuthModalView("signup");
    setAuthModalOpen(true);
  };

  // Close hamburger on outside click
  useEffect(() => {
    if (!hamburgerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-hamburger-menu]')) {
        setHamburgerOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hamburgerOpen]);

  return (
    <nav className={`bg-white shadow-sm border-b sticky top-0 z-50 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">

          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/olera-logo.jpg" alt="" className="w-8 h-8" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900">Olera</span>
            </Link>
          </div>

          {/* Center: Care type hover dropdowns (desktop) — absolutely centered */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {MAIN_CATEGORIES.map((category) => (
              <div
                key={category.slug}
                className="relative"
                onMouseEnter={() => setOpenDropdown(category.slug)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={`/browse?type=${category.type}`}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  {category.name}
                  <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {openDropdown === category.slug && (
                  <div className="absolute left-0 mt-0 w-64 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50">
                    {category.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* More dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("more")}
              onMouseLeave={() => {
                setOpenDropdown(null);
                setOpenOtherSubdropdown(null);
              }}
            >
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                More
                <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === "more" && (
                <div className="absolute left-0 mt-0 w-56 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50">
                  {OTHER_CATEGORIES.map((sub) => (
                    <div
                      key={sub.slug}
                      className="relative"
                      onMouseEnter={() => setOpenOtherSubdropdown(sub.slug)}
                      onMouseLeave={() => setOpenOtherSubdropdown(null)}
                    >
                      <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 flex items-center justify-between">
                        {sub.name}
                        <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {openOtherSubdropdown === sub.slug && (
                        <div className="absolute left-full top-0 ml-1 w-64 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50">
                          {sub.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
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
          </div>

          {/* Right: bold "Become a provider" text + hamburger (desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {session && (
              <NotificationDropdown
                unreadCount={unreadCount}
                onUnreadCountChange={setUnreadCount}
              />
            )}

            <Link
              href="/for-providers"
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Become a provider
            </Link>

            {/* Hamburger pill button */}
            <div className="relative" data-hamburger-menu>
              <button
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full hover:shadow-md transition-all"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center">
                  {session ? (
                    <span className="text-xs font-medium text-white">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '!' : unreadCount}
                  </span>
                )}
              </button>

              {/* Desktop hamburger dropdown */}
              {hamburgerOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50">
                  {session ? (
                    <>
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 break-words">{session.user?.email}</p>
                        <div className="mt-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isProviderMode ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isProviderMode ? 'Provider Mode' : 'Family Mode'}
                          </span>
                        </div>
                      </div>

                      {isProviderMode ? (
                        <>
                          {providerType ? (
                            <>
                              <Link href="/provider/leads" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Leads</Link>
                              <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                <span>Requests</span>
                                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                              </Link>
                              <Link href="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Profile</Link>
                              <div className="border-t border-gray-100 my-1"></div>
                              {providerType === 'INDEPENDENT_CAREGIVER' ? (
                                <>
                                  <Link href="/providers/browse-organizations" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Find Organizations</Link>
                                  <Link href="/provider/opportunities" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Opportunities</Link>
                                </>
                              ) : (
                                <>
                                  <Link href="/provider/hire-staff" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Hire Care Staff</Link>
                                  <Link href="/provider/candidates" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Candidates</Link>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Link href="/provider/leads" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Leads</Link>
                              <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                <span>Requests</span>
                                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                              </Link>
                              <Link href="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Profile</Link>
                              <div className="border-t border-gray-100 my-1"></div>
                              <Link href="/provider/hire-staff" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Hire Care Staff</Link>
                              <button onClick={() => { setHamburgerOpen(false); triggerProviderOnboarding('individual'); }} className="block w-full text-left px-4 py-2.5 text-sm text-primary-600 hover:bg-gray-50 font-medium">Become a Caregiver</button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Link href="/browse" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Browse Providers</Link>
                          <Link href="/saved" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Saved</Link>
                          <Link href="/matches" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                            <span>Matches</span>
                            {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                          </Link>
                          <Link href="/care-profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Care Profile</Link>
                          <Link href="/benefits" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Benefits</Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>
                      {isProviderMode ? (
                        <button onClick={() => { handleModeSwitch('FAMILY'); setHamburgerOpen(false); }} disabled={switchingMode} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                          {switchingMode ? 'Switching...' : 'Switch to Family Mode'}
                        </button>
                      ) : (
                        <button onClick={() => { handleModeSwitch('PROVIDER'); setHamburgerOpen(false); }} disabled={switchingMode} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                          {switchingMode ? 'Switching...' : 'Switch to Provider Mode'}
                        </button>
                      )}
                      <Link href="/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Settings</Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={() => { setHamburgerOpen(false); setSignOutModalOpen(true); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Log out</button>
                    </>
                  ) : (
                    <>
                      {/* Logged out menu — icons + combined auth */}
                      <button
                        onClick={() => { setHamburgerOpen(false); triggerProviderOnboarding('organization'); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        List your organization
                      </button>
                      <button
                        onClick={() => { setHamburgerOpen(false); triggerProviderOnboarding('individual'); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Find caregiver work
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => { setHamburgerOpen(false); setAuthModalView("signup"); setAuthModalOpen(true); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Log in / Sign up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: hamburger on right */}
          <div className="lg:hidden flex items-center gap-2">
            {session && (
              <NotificationDropdown
                unreadCount={unreadCount}
                onUnreadCountChange={setUnreadCount}
              />
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 border border-gray-200 rounded-full hover:shadow-md transition-all"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center">
                {session ? (
                  <span className="text-xs font-medium text-white">{session.user?.name?.charAt(0).toUpperCase()}</span>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? '!' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-1">
            {session ? (
              <>
                <div className="px-3 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                  <div className="mt-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isProviderMode ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isProviderMode ? 'Provider Mode' : 'Family Mode'}
                    </span>
                  </div>
                </div>

                <Link href="/notifications" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>

                {isProviderMode ? (
                  <>
                    {providerType ? (
                      <>
                        <Link href="/provider/leads" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Leads</Link>
                        <Link href="/provider/requests" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          <span>Requests</span>
                          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                        </Link>
                        <Link href="/provider/profile" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        {providerType === 'INDEPENDENT_CAREGIVER' ? (
                          <>
                            <Link href="/providers/browse-organizations" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Find Organizations</Link>
                            <Link href="/provider/opportunities" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>My Opportunities</Link>
                          </>
                        ) : (
                          <>
                            <Link href="/provider/hire-staff" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Hire Care Staff</Link>
                            <Link href="/provider/candidates" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>My Candidates</Link>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link href="/provider/leads" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Leads</Link>
                        <Link href="/provider/requests" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          <span>Requests</span>
                          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                        </Link>
                        <Link href="/provider/profile" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link href="/provider/hire-staff" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Hire Care Staff</Link>
                        <button onClick={() => { setMobileMenuOpen(false); triggerProviderOnboarding('individual'); }} className="block w-full text-left px-3 py-3 text-primary-600 font-medium hover:bg-gray-50">Become a Caregiver</button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/browse" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Browse Providers</Link>
                    <Link href="/saved" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Saved</Link>
                    <Link href="/matches" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      <span>Matches</span>
                      {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </Link>
                    <Link href="/care-profile" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Care Profile</Link>
                    <Link href="/benefits" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Benefits</Link>
                  </>
                )}

                <div className="border-t border-gray-100 my-1"></div>
                {isProviderMode ? (
                  <button onClick={() => { handleModeSwitch('FAMILY'); setMobileMenuOpen(false); }} disabled={switchingMode} className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    {switchingMode ? 'Switching...' : 'Switch to Family Mode'}
                  </button>
                ) : (
                  <button onClick={() => { handleModeSwitch('PROVIDER'); setMobileMenuOpen(false); }} disabled={switchingMode} className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    {switchingMode ? 'Switching...' : 'Switch to Provider Mode'}
                  </button>
                )}
                <Link href="/settings" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={() => { setMobileMenuOpen(false); setSignOutModalOpen(true); }} className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50">Log out</button>
              </>
            ) : (
              <>
                <div className="py-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); triggerProviderOnboarding('organization'); }}
                    className="flex items-center gap-3 w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    List your organization
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); triggerProviderOnboarding('individual'); }}
                    className="flex items-center gap-3 w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Find caregiver work
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setAuthModalView("signup"); setAuthModalOpen(true); }}
                    className="flex items-center gap-3 w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Log in / Sign up
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setAuthIntent(undefined); setAuthProviderSubtype(undefined); }}
        defaultView={authModalView}
        intent={authIntent}
        providerSubtype={authProviderSubtype}
      />
      <SignOutModal isOpen={signOutModalOpen} onClose={() => setSignOutModalOpen(false)} />
    </nav>
  );
}

function MainNavFallback() {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function MainNav({ hidden }: { hidden?: boolean }) {
  return (
    <Suspense fallback={<MainNavFallback />}>
      <MainNavContent hidden={hidden} />
    </Suspense>
  );
}
