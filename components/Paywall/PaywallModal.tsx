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
    name: 'Connect with More Families',
    price: '$25',
    period: '/month',
    features: [
      'Message unlimited families',
      'Connect with job opportunities',
      'See contact information when accepted',
      'Save your favorite connections',
      'Get help when you need it',
    ],
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Start Connecting Today</h2>
            <p className="text-gray-600 mt-1">
              Send unlimited messages for $25 per month
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pricing Card */}
        <div className="p-6">
          <div className="max-w-md mx-auto mb-6">
            <div className="relative border-2 border-primary-600 rounded-lg p-8 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{TIER_INFO.PRO.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-gray-900">{TIER_INFO.PRO.price}</span>
                  <span className="text-gray-600 ml-2 text-lg">{TIER_INFO.PRO.period}</span>
                </div>
                <p className="text-sm text-gray-600">Start connecting with families today</p>
              </div>

              <ul className="space-y-4">
                {TIER_INFO.PRO.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Testing Mode</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This is a free demo. No payment required - you can try all features right now.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {upgrading ? 'Activating...' : 'Get Started'}
            </button>
            <button
              onClick={onClose}
              disabled={upgrading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
