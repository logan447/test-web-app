'use client';

/**
 * WelcomeBanner - Post-onboarding welcome experience
 *
 * Shows a celebratory welcome message when users first land after completing onboarding.
 * Reinforces the value proposition and guides them to their first action.
 *
 * Usage: Include on landing pages and pass isVisible based on URL param (?welcome=true)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

export type WelcomeVariant = 'organization' | 'caregiver' | 'family';

interface WelcomeBannerProps {
  variant: WelcomeVariant;
  isVisible: boolean;
  onDismiss?: () => void;
}

const variantConfig = {
  organization: {
    title: 'Welcome to Olera!',
    subtitle: 'You\'re now visible to families looking for care services.',
    icon: '🏢',
    bgGradient: 'from-emerald-500 to-teal-600',
    valueProps: [
      { icon: '👨‍👩‍👧', text: 'Families can discover and contact you' },
      { icon: '📅', text: 'Schedule tours and consultations' },
      { icon: '👥', text: 'Access the caregiver hiring marketplace' },
    ],
    primaryAction: {
      text: 'View Family Inquiries',
      href: '/provider/leads',
    },
    secondaryAction: {
      text: 'Complete Your Profile',
      href: '/provider/profile/edit',
    },
  },
  caregiver: {
    title: 'Welcome to Olera!',
    subtitle: 'You\'re now visible to employers looking for caregivers.',
    icon: '💼',
    bgGradient: 'from-blue-500 to-indigo-600',
    valueProps: [
      { icon: '🏢', text: 'Agencies and facilities can see your profile' },
      { icon: '👨‍👩‍👧', text: 'Families can hire you directly' },
      { icon: '🔔', text: 'Get notified when matched to opportunities' },
    ],
    primaryAction: {
      text: 'Browse Opportunities',
      href: '/providers/browse-organizations',
    },
    secondaryAction: {
      text: 'Complete Your Profile',
      href: '/provider/profile/edit',
    },
  },
  family: {
    title: 'Welcome to Olera!',
    subtitle: 'Start your search for the perfect care provider.',
    icon: '🏠',
    bgGradient: 'from-primary-500 to-primary-700',
    valueProps: [
      { icon: '🔍', text: 'Browse verified care providers' },
      { icon: '📅', text: 'Schedule tours and consultations' },
      { icon: '💬', text: 'Message providers directly' },
    ],
    primaryAction: {
      text: 'Browse Providers',
      href: '/browse',
    },
    secondaryAction: {
      text: 'Complete Your Profile',
      href: '/care-profile/edit',
    },
  },
};

export default function WelcomeBanner({ variant, isVisible, onDismiss }: WelcomeBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay to allow animation
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const config = variantConfig[variant];

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  return (
    <div
      className={`mb-8 transition-all duration-300 ${
        show ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
      }`}
    >
      <div className={`bg-gradient-to-r ${config.bgGradient} rounded-2xl overflow-hidden shadow-lg`}>
        <div className="relative px-6 py-6 md:px-8 md:py-8">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss welcome message"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Left: Icon and text */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{config.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{config.title}</h2>
                  <p className="text-white/90">{config.subtitle}</p>
                </div>
              </div>

              {/* Value props */}
              <div className="flex flex-wrap gap-4 mt-4">
                {config.valueProps.map((prop, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                    <span>{prop.icon}</span>
                    <span>{prop.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={config.primaryAction.href}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {config.primaryAction.text}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href={config.secondaryAction.href}
                className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-colors border border-white/30"
              >
                {config.secondaryAction.text}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
