"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * Footer - Unified footer component for all pages
 *
 * Variants:
 * - light: Gray gradient background (default for interior pages)
 * - dark: Dark background (homepage, landing pages)
 */

interface FooterProps {
  variant?: "light" | "dark";
  showNewsletter?: boolean;
}

export default function Footer({ variant = "light", showNewsletter = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const isDark = variant === "dark";

  // Style maps
  const containerStyles = isDark
    ? "bg-gray-900 text-gray-400"
    : "bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200";

  const headingStyles = isDark ? "text-white" : "text-gray-900";

  const linkStyles = isDark
    ? "text-gray-400 hover:text-white transition-colors"
    : "text-gray-600 hover:text-primary-600 transition-colors";

  const socialBtnStyles = isDark
    ? "w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
    : "w-10 h-10 bg-gray-200 hover:bg-primary-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 transition-colors";

  const dividerStyles = isDark
    ? "border-t border-gray-800"
    : "border-t border-gray-200";

  const mutedTextStyles = isDark ? "text-gray-500" : "text-gray-500";

  return (
    <footer className={containerStyles}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/bird-logo.svg"
                alt="Olera"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className={`text-xl font-bold ${headingStyles}`}>Olera</span>
            </div>
            <p className={`text-sm leading-relaxed mb-6 max-w-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Helping families find quality senior care with confidence.
              We believe every family deserves access to compassionate,
              qualified care for their loved ones.
            </p>

            {/* Newsletter Signup */}
            {showNewsletter && (
              <div className="mb-6">
                <p className={`text-sm font-medium ${headingStyles} mb-2`}>
                  Senior care tips delivered weekly
                </p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnStyles}
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnStyles}
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnStyles}
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnStyles}
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* For Families */}
          <div>
            <h3 className={`font-semibold ${headingStyles} mb-4`}>For Families</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/browse" className={linkStyles}>
                  Browse Providers
                </Link>
              </li>
              <li>
                <Link href="/browse?type=ASSISTED_LIVING" className={linkStyles}>
                  Assisted Living
                </Link>
              </li>
              <li>
                <Link href="/browse?type=MEMORY_CARE" className={linkStyles}>
                  Memory Care
                </Link>
              </li>
              <li>
                <Link href="/browse?type=HOME_CARE" className={linkStyles}>
                  Home Care
                </Link>
              </li>
              <li>
                <Link href="/care-profile" className={linkStyles}>
                  Care Profile
                </Link>
              </li>
              <li>
                <Link href="/benefits" className={linkStyles}>
                  Benefits Finder
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className={`font-semibold ${headingStyles} mb-4`}>For Providers</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/for-providers" className={linkStyles}>
                  Why Olera
                </Link>
              </li>
              <li>
                <Link href="/signup?intent=provider" className={linkStyles}>
                  List Your Services
                </Link>
              </li>
              <li>
                <Link href="/provider/leads" className={linkStyles}>
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/provider/profile" className={linkStyles}>
                  Manage Profile
                </Link>
              </li>
              <li>
                <Link href="/pricing" className={linkStyles}>
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className={`font-semibold ${headingStyles} mb-4`}>Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className={linkStyles}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkStyles}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkStyles}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={linkStyles}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 ${dividerStyles}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className={`text-sm ${mutedTextStyles}`}>
              &copy; {currentYear} Olera, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className={`flex items-center gap-2 ${mutedTextStyles}`}>
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure & Trusted
              </span>
              <span className={`flex items-center gap-2 ${mutedTextStyles}`}>
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                HIPAA Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
