'use client';

import { useState } from 'react';
import { showToast } from '@/lib/toast';

type SubscriptionTier = 'PRO';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: SubscriptionTier) => Promise<void>;
}

const TIER_INFO = {
  PRO: {
    name: 'Provider Pro',
    price: '$25',
    period: '/month',
    headline: 'Grow your care business',
    subheadline: 'Connect directly with families who need your services',
    features: [
      {
        title: 'Unlimited messaging',
        description: 'Send messages to any family seeking care',
      },
      {
        title: 'Direct contact access',
        description: 'Get phone & email when families accept your request',
      },
      {
        title: 'Smart matching',
        description: 'See families matched to your care specialties',
      },
      {
        title: 'Priority listing',
        description: 'Appear higher in search results',
      },
      {
        title: 'Saved leads',
        description: 'Bookmark families to follow up later',
      },
    ],
    guarantee: 'Cancel anytime. No long-term commitment.',
  },
};

export default function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
  const [upgrading, setUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      await onUpgrade(selectedTier);
      onClose();
    } catch (error) {
      console.error('Upgrade error:', error);
      showToast.error('Failed to upgrade subscription');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-8 text-white rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white mb-4">
              {TIER_INFO.PRO.name}
            </span>
            <h2 className="text-2xl font-bold mb-2">{TIER_INFO.PRO.headline}</h2>
            <p className="text-primary-100">{TIER_INFO.PRO.subheadline}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">{TIER_INFO.PRO.price}</span>
            <span className="text-gray-500 ml-2">{TIER_INFO.PRO.period}</span>
          </div>
          <p className="text-center text-sm text-gray-500 mt-1">{TIER_INFO.PRO.guarantee}</p>
        </div>

        {/* Features */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            What&apos;s included
          </h3>
          <ul className="space-y-4">
            {TIER_INFO.PRO.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{feature.title}</p>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Demo Mode Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Demo Mode Active</p>
                <p className="text-sm text-blue-600 mt-0.5">
                  Try all features free - no payment needed.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full bg-primary-600 text-white px-6 py-3.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-sm"
            >
              {upgrading ? 'Activating...' : 'Start Connecting Now'}
            </button>
            <button
              onClick={onClose}
              disabled={upgrading}
              className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
