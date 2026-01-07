"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/Auth/AuthModal";
import { showToast } from "@/lib/toast";

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

export default function MainNav() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openOtherSubdropdown, setOpenOtherSubdropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("login");
  const [switchingMode, setSwitchingMode] = useState(false);

  // Mode switching handler
  const handleModeSwitch = async (newMode: 'FAMILY' | 'PROVIDER') => {
    if (switchingMode) return;

    try {
      setSwitchingMode(true);

      // Call API to switch mode
      const response = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to switch mode:', data.error);
        showToast.error('Failed to switch mode');
        return;
      }

      // Update session
      await update({ activeMode: newMode });

      // Show success toast
      showToast.success(`Switched to ${newMode === 'PROVIDER' ? 'Provider' : 'Family'} mode`);

      // Redirect to appropriate landing page
      router.push(data.landingPage);
      router.refresh();

    } catch (error) {
      console.error('Error switching mode:', error);
      showToast.error('Failed to switch mode');
    } finally {
      setSwitchingMode(false);
    }
  };

  const currentMode = session?.user?.activeMode || 'FAMILY';
  const isProviderMode = currentMode === 'PROVIDER';

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-xl font-bold">O</span>
              </div>
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
                <button className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
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
              <button className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium flex items-center">
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

            <Link
              href="/plan-care"
              className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
            >
              Plan Care
            </Link>

            <Link
              href="/providers"
              className="px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
            >
              For providers
            </Link>
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
                    <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                  {isProviderMode ? (
                    <>
                      <Link href="/provider/requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Browse Care Requests
                      </Link>
                      <Link href="/provider/saved" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Saved
                      </Link>
                      <Link href="/dashboard/requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Consultation Requests
                      </Link>
                      <Link href="/dashboard/provider-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Provider Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/providers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Browse Providers
                      </Link>
                      <Link href="/dashboard/saved" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Saved
                      </Link>
                      <Link href="/dashboard/requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Requests
                      </Link>
                      <Link href="/dashboard/care-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Care Profile
                      </Link>
                    </>
                  )}
                  <div className="border-t border-gray-200 mt-1 pt-1">
                    {isProviderMode ? (
                      <button
                        onClick={() => handleModeSwitch('FAMILY')}
                        disabled={switchingMode}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {switchingMode ? 'Switching...' : 'For Families'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModeSwitch('PROVIDER')}
                        disabled={switchingMode}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {switchingMode ? 'Switching...' : 'For Providers'}
                      </button>
                    )}
                  </div>
                  <div className="border-t border-gray-200">
                    <Link href="/api/auth/signout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Log Out
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthModalView("login");
                    setAuthModalOpen(true);
                  }}
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalView("signup");
                    setAuthModalOpen(true);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
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

            <Link href="/plan-care" className="block px-3 py-2 text-gray-700 font-medium">
              Plan Care
            </Link>
            <Link href="/providers" className="block px-3 py-2 text-gray-700 font-medium">
              For providers
            </Link>

            <div className="border-t mt-4 pt-4">
              {session ? (
                <>
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                  {isProviderMode ? (
                    <>
                      <Link href="/provider/requests" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Browse Care Requests
                      </Link>
                      <Link href="/provider/saved" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Saved
                      </Link>
                      <Link href="/dashboard/requests" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Consultation Requests
                      </Link>
                      <Link href="/dashboard/provider-profile" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Provider Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/providers" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Browse Providers
                      </Link>
                      <Link href="/dashboard/saved" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Saved
                      </Link>
                      <Link href="/dashboard/requests" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Requests
                      </Link>
                      <Link href="/dashboard/care-profile" className="block px-3 py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                        Care Profile
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
                      {switchingMode ? 'Switching...' : 'Switch to Family'}
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
                      {switchingMode ? 'Switching...' : 'For Providers'}
                    </button>
                  )}
                  <Link href="/api/auth/signout" className="block px-3 py-2 text-gray-700">
                    Log Out
                  </Link>
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
    </nav>
  );
}
