"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AuthModal from "@/components/Auth/AuthModal";
import SignOutModal from "@/components/Auth/SignOutModal";
import NotificationDropdown from "@/components/Navigation/NotificationDropdown";
import { showToast } from "@/lib/toast";

// Care type links for centered navigation (browse filter shortcuts)
const NAV_CARE_TYPES = [
  { label: "Home Care", type: "HOME_CARE" },
  { label: "Assisted Living", type: "ASSISTED_LIVING" },
  { label: "Memory Care", type: "MEMORY_CARE" },
  { label: "Nursing Homes", type: "NURSING_HOME" },
];

// "More" care types shown in a simple dropdown
const MORE_CARE_TYPES = [
  { label: "Independent Living", type: "INDEPENDENT_LIVING" },
  { label: "Hospice Care", type: "HOSPICE" },
  { label: "Rehabilitation", type: "REHABILITATION" },
];

function MainNavContent() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
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

  // Mode switching handler - updates DB and session
  const handleModeSwitch = async (newMode: 'FAMILY' | 'PROVIDER') => {
    if (switchingMode) return;

    setSwitchingMode(true);

    try {
      const response = await fetch('/api/user/mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch mode');
      }

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
    const params = new URLSearchParams();
    params.set('onboarding', 'true');
    params.set('intent', 'provider');
    if (subtype) {
      params.set('providerSubtype', subtype);
    }
    router.push(`/provider/leads?${params.toString()}`);
  };

  // Close hamburger menu when clicking outside
  useEffect(() => {
    if (!hamburgerOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-hamburger-menu]')) {
        setHamburgerOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hamburgerOpen]);

  // Close more dropdown when clicking outside
  useEffect(() => {
    if (!moreDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-more-dropdown]')) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [moreDropdownOpen]);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
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

          {/* Center: Care type links (desktop only) */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_CARE_TYPES.map((ct) => (
              <Link
                key={ct.type}
                href={`/browse?type=${ct.type}`}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {ct.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" data-more-dropdown>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50">
                  {MORE_CARE_TYPES.map((ct) => (
                    <Link
                      key={ct.type}
                      href={`/browse?type=${ct.type}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setMoreDropdownOpen(false)}
                    >
                      {ct.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: "Become a provider" button + hamburger (desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Notifications (authenticated only) */}
            {session && (
              <NotificationDropdown
                unreadCount={unreadCount}
                onUnreadCountChange={setUnreadCount}
              />
            )}

            <Link
              href="/for-providers"
              className="px-4 py-2 text-sm font-semibold text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Become a provider
            </Link>

            {/* Hamburger menu button */}
            <div className="relative" data-hamburger-menu>
              <button
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full hover:shadow-md transition-all"
              >
                {/* Hamburger icon */}
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* User avatar circle */}
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
                {/* Unread indicator */}
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
                            isProviderMode
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isProviderMode ? 'Provider Mode' : 'Family Mode'}
                          </span>
                        </div>
                      </div>

                      {isProviderMode ? (
                        <>
                          {providerType ? (
                            <>
                              <Link href="/provider/leads" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                Leads
                              </Link>
                              <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                <span>Requests</span>
                                {unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </Link>
                              <Link href="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                My Profile
                              </Link>
                              <div className="border-t border-gray-100 my-1"></div>
                              {providerType === 'INDEPENDENT_CAREGIVER' ? (
                                <>
                                  <Link href="/providers/browse-organizations" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                    Find Organizations
                                  </Link>
                                  <Link href="/provider/opportunities" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                    My Opportunities
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <Link href="/provider/hire-staff" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                    Hire Care Staff
                                  </Link>
                                  <Link href="/provider/candidates" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                    My Candidates
                                  </Link>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Link href="/provider/leads" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                Leads
                              </Link>
                              <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                <span>Requests</span>
                                {unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                  </span>
                                )}
                              </Link>
                              <Link href="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                My Profile
                              </Link>
                              <div className="border-t border-gray-100 my-1"></div>
                              <Link href="/provider/hire-staff" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                Hire Care Staff
                              </Link>
                              <button
                                onClick={() => {
                                  setHamburgerOpen(false);
                                  triggerProviderOnboarding('individual');
                                }}
                                className="block w-full text-left px-4 py-2.5 text-sm text-primary-600 hover:bg-gray-50 font-medium"
                              >
                                Become a Caregiver
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Link href="/browse" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                            Browse Providers
                          </Link>
                          <Link href="/saved" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                            Saved
                          </Link>
                          <Link href="/matches" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                            <span>Matches</span>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link href="/care-profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                            Care Profile
                          </Link>
                          <Link href="/benefits" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                            Benefits
                          </Link>
                        </>
                      )}

                      {/* Mode switch + settings + logout */}
                      <div className="border-t border-gray-100 my-1"></div>
                      {isProviderMode ? (
                        <button
                          onClick={() => {
                            handleModeSwitch('FAMILY');
                            setHamburgerOpen(false);
                          }}
                          disabled={switchingMode}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {switchingMode ? 'Switching...' : 'Switch to Family Mode'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleModeSwitch('PROVIDER');
                            setHamburgerOpen(false);
                          }}
                          disabled={switchingMode}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {switchingMode ? 'Switching...' : 'Switch to Provider Mode'}
                        </button>
                      )}
                      <Link href="/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setHamburgerOpen(false);
                          setSignOutModalOpen(true);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Logged out menu */}
                      <button
                        onClick={() => {
                          setHamburgerOpen(false);
                          triggerProviderOnboarding('organization');
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        List your organization
                      </button>
                      <button
                        onClick={() => {
                          setHamburgerOpen(false);
                          triggerProviderOnboarding('individual');
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Find caregiver work
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setHamburgerOpen(false);
                          setAuthModalView("login");
                          setAuthModalOpen(true);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Log in
                      </button>
                      <button
                        onClick={() => {
                          setHamburgerOpen(false);
                          setAuthModalView("signup");
                          setAuthModalOpen(true);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Logo already on left, hamburger on right */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Notifications (authenticated, mobile) */}
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
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 mt-1">
            {session ? (
              <>
                {/* User info */}
                <div className="px-3 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                  <div className="mt-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isProviderMode
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isProviderMode ? 'Provider Mode' : 'Family Mode'}
                    </span>
                  </div>
                </div>

                {/* Notifications link */}
                <Link href="/notifications" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {isProviderMode ? (
                  <>
                    {providerType ? (
                      <>
                        <Link href="/provider/leads" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          Leads
                        </Link>
                        <Link href="/provider/requests" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          <span>Requests</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link href="/provider/profile" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          My Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        {providerType === 'INDEPENDENT_CAREGIVER' ? (
                          <>
                            <Link href="/providers/browse-organizations" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                              Find Organizations
                            </Link>
                            <Link href="/provider/opportunities" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                              My Opportunities
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link href="/provider/hire-staff" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                              Hire Care Staff
                            </Link>
                            <Link href="/provider/candidates" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                              My Candidates
                            </Link>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link href="/provider/leads" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          Leads
                        </Link>
                        <Link href="/provider/requests" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          <span>Requests</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link href="/provider/profile" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          My Profile
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link href="/provider/hire-staff" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                          Hire Care Staff
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            triggerProviderOnboarding('individual');
                          }}
                          className="block w-full text-left px-3 py-3 text-primary-600 font-medium hover:bg-gray-50"
                        >
                          Become a Caregiver
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/browse" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Browse Providers
                    </Link>
                    <Link href="/saved" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Saved
                    </Link>
                    <Link href="/matches" className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      <span>Matches</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/care-profile" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Care Profile
                    </Link>
                    <Link href="/benefits" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Benefits
                    </Link>
                  </>
                )}

                {/* Mode switch, settings, logout */}
                <div className="border-t border-gray-100 my-1"></div>
                {isProviderMode ? (
                  <button
                    onClick={() => {
                      handleModeSwitch('FAMILY');
                      setMobileMenuOpen(false);
                    }}
                    disabled={switchingMode}
                    className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                    className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {switchingMode ? 'Switching...' : 'Switch to Provider Mode'}
                  </button>
                )}
                <Link href="/settings" className="block px-3 py-3 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignOutModalOpen(true);
                  }}
                  className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                {/* Logged out mobile menu */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      triggerProviderOnboarding('organization');
                    }}
                    className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    List your organization
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      triggerProviderOnboarding('individual');
                    }}
                    className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Find caregiver work
                  </button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalView("login");
                      setAuthModalOpen(true);
                    }}
                    className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalView("signup");
                      setAuthModalOpen(true);
                    }}
                    className="block w-full text-left px-3 py-3 text-primary-600 font-semibold hover:bg-gray-50"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}
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

// Fallback component for Suspense
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

// Default export wraps the component in Suspense to handle useSearchParams
export default function MainNav() {
  return (
    <Suspense fallback={<MainNavFallback />}>
      <MainNavContent />
    </Suspense>
  );
}
