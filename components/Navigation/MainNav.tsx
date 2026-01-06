"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const CARE_CATEGORIES = [
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

export default function MainNav() {
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            {CARE_CATEGORIES.map((category) => (
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
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/care-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Care Profile
                  </Link>
                  <Link href="/dashboard/requests" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Requests
                  </Link>
                  <Link href="/api/auth/signout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Log Out
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
                >
                  Get Started
                </Link>
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
            {CARE_CATEGORIES.map((category) => (
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

            <Link href="/plan-care" className="block px-3 py-2 text-gray-700 font-medium">
              Plan Care
            </Link>
            <Link href="/providers" className="block px-3 py-2 text-gray-700 font-medium">
              For providers
            </Link>

            <div className="border-t mt-4 pt-4">
              {session ? (
                <>
                  <Link href="/dashboard" className="block px-3 py-2 text-gray-700">
                    Dashboard
                  </Link>
                  <Link href="/api/auth/signout" className="block px-3 py-2 text-gray-700">
                    Log Out
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 text-gray-700">
                    Sign In
                  </Link>
                  <Link href="/signup" className="block px-3 py-2 bg-primary-600 text-white rounded-md text-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
