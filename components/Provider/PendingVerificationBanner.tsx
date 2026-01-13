'use client';

import { useEffect, useState } from 'react';

type VerificationStatus = {
  authenticated: boolean;
  hasProvider: boolean;
  isVerified: boolean;
  providerId?: string;
  providerName?: string;
  verificationStatus?: string;
  email?: string;
};

export default function PendingVerificationBanner() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/providers/verification-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Only show banner if user has provider profile but not verified
  if (!status?.hasProvider || status?.isVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Provider Profile Pending Admin Review
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">
              Your claim to <span className="font-semibold">{status?.providerName}</span> is being reviewed by our team.
            </p>
            <p className="mb-3">
              Until approved, you have limited access. You can browse but cannot:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Edit your provider profile</li>
              <li>View or respond to leads and inquiries</li>
              <li>Access sensitive information</li>
            </ul>
            <p className="text-xs mb-3 font-medium">
              Our team typically reviews claims within 24 hours. You&apos;ll receive an email at <span className="font-semibold">{status?.email}</span> when your claim is approved or if we need additional information.
            </p>
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
