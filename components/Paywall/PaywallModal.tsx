'use client';

import { useState } from 'react';
import { showToast } from '@/lib/toast';

type SubscriptionTier = 'BASIC' | 'PRO';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: SubscriptionTier) => Promise<void>;
}

const TIER_INFO = {
  BASIC: {
    name: 'Basic',
    price: '$29',
    period: '/month',
    contactViews: '10 contact views per month',
    features: [
      'View up to 10 family contact details',
      'Save unlimited care requests',
      'Email support',
      'Monthly usage reports',
    ],
  },
  PRO: {
    name: 'Pro',
    price: '$99',
    period: '/month',
    contactViews: 'Unlimited contact views',
    features: [
      'Unlimited family contact views',
      'Save unlimited care requests',
      'Priority email support',
      'Advanced analytics',
      'Early access to new features',
    ],
    popular: true,
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
            <h2 className="text-2xl font-bold text-gray-900">Unlock Contact Information</h2>
            <p className="text-gray-600 mt-1">
              Subscribe to view family contact details and connect with care requests
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

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {(Object.keys(TIER_INFO) as SubscriptionTier[]).map((tier) => {
              const info = TIER_INFO[tier];
              const isSelected = selectedTier === tier;

              return (
                <div
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-600 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {info.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{info.name}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary-600' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{info.price}</span>
                      <span className="text-gray-600 ml-1">{info.period}</span>
                    </div>
                    <p className="text-sm text-primary-600 font-medium mt-1">
                      {info.contactViews}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {info.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
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
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0"
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
                <h4 className="text-sm font-medium text-yellow-800">Demo Mode</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a demonstration. Your subscription will be activated instantly without payment.
                  Real payment integration coming soon.
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
              {upgrading ? 'Upgrading...' : `Upgrade to ${TIER_INFO[selectedTier].name}`}
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
