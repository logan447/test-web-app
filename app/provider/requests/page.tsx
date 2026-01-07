'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProviderRequests() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Care Requests</h1>
          <p className="mt-2 text-gray-600">
            Browse and respond to care requests from families in your area
          </p>
        </div>

        {/* Provider mode indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-blue-600 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-900 font-medium">
              You are in Provider Mode
            </span>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No care requests yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Care requests from families will appear here. Check back soon!
          </p>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Complete Your Profile
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add more details to help families find you
            </p>
            <button
              disabled
              className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400"
            >
              Coming Soon
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Saved Requests
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              View care requests you&apos;ve saved for later
            </p>
            <button
              disabled
              className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400"
            >
              Coming Soon
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Active Conversations
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage your ongoing conversations with families
            </p>
            <button
              disabled
              className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
