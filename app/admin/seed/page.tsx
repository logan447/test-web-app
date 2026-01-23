'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AccountStatus {
  email: string;
  name: string;
  expectedRole: string;
  expectedMode: string;
  exists: boolean;
  actualRole: string | null;
  actualMode: string | null;
  hasFamilyProfile: boolean;
  hasProviderIdentity: boolean;
  isCorrectlyConfigured: boolean;
}

interface SeedStatus {
  status: 'ready' | 'needs_seeding';
  password: string;
  accounts: AccountStatus[];
  summary: {
    total: number;
    existing: number;
    correctlyConfigured: number;
  };
}

/**
 * Admin page for managing test accounts
 * Used for sprint auditing and demo purposes
 */
export default function SeedAdminPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [seedStatus, setSeedStatus] = useState<SeedStatus | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check seed status on load
  useEffect(() => {
    if (status === 'authenticated') {
      checkSeedStatus();
    }
  }, [status]);

  const checkSeedStatus = async () => {
    setChecking(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/seed');
      const data = await response.json();

      if (data.success) {
        setSeedStatus(data.data);
      } else {
        setError(data.error?.message || 'Failed to check status');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setChecking(false);
    }
  };

  const runSeed = async (reset: boolean = false, mode: 'test' | 'full' = 'test') => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset, mode }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        // Refresh status
        await checkSeedStatus();
      } else {
        setError(data.error?.message || 'Failed to seed');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access this page</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Not admin
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Access Denied</p>
          <p className="text-gray-600 mt-2">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Test Account Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage test accounts for sprint auditing and demos
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
            <button
              onClick={checkSeedStatus}
              disabled={checking}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {checking ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          {checking ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : seedStatus ? (
            <>
              {/* Summary */}
              <div className={`rounded-lg p-4 mb-4 ${
                seedStatus.status === 'ready'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {seedStatus.status === 'ready' ? '✅' : '⚠️'}
                  </span>
                  <div>
                    <p className="font-medium">
                      {seedStatus.status === 'ready'
                        ? 'Test accounts ready'
                        : 'Test accounts need seeding'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {seedStatus.summary.correctlyConfigured}/{seedStatus.summary.total} accounts configured
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Account</th>
                      <th className="text-left py-2 px-3">Email</th>
                      <th className="text-left py-2 px-3">Role</th>
                      <th className="text-left py-2 px-3">Mode</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seedStatus.accounts.map((account) => (
                      <tr key={account.email} className="border-b">
                        <td className="py-2 px-3 font-medium">{account.name}</td>
                        <td className="py-2 px-3 font-mono text-xs">{account.email}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.expectedRole === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : account.expectedRole === 'PROVIDER'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {account.expectedRole}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.expectedMode === 'PROVIDER'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {account.expectedMode}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {account.isCorrectlyConfigured ? (
                            <span className="text-green-600">✓ Ready</span>
                          ) : account.exists ? (
                            <span className="text-yellow-600">⚠ Misconfigured</span>
                          ) : (
                            <span className="text-red-600">✗ Missing</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Password Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Password for all test accounts:</strong>{' '}
                  <code className="bg-gray-200 px-2 py-1 rounded">{seedStatus.password}</code>
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

          <div className="space-y-4">
            {/* Full Demo Seed - Primary action */}
            <div className="p-4 border-2 border-primary-200 bg-primary-50 rounded-lg">
              <button
                onClick={() => runSeed(false, 'full')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition shadow-md"
              >
                {loading ? 'Seeding 90+ accounts...' : 'Full Demo Seed (90+ Accounts)'}
              </button>
              <p className="text-sm text-primary-700 mt-2 font-medium">
                Creates comprehensive demo data with photos:
              </p>
              <ul className="text-xs text-primary-600 mt-1 space-y-0.5">
                <li>- 36 family accounts (all with profile photos)</li>
                <li>- 36 facility/organization accounts (5-10 photos each)</li>
                <li>- 18 individual caregiver accounts (with photos)</li>
                <li>- 30 consultation requests, tours, saved providers</li>
                <li>- Password for all: <code className="bg-primary-100 px-1 rounded">demo123</code></li>
              </ul>
            </div>

            <hr className="my-4" />
            <p className="text-sm text-gray-500 font-medium">Test Accounts Only:</p>

            <div>
              <button
                onClick={() => runSeed(false, 'test')}
                disabled={loading}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Seeding...' : 'Seed Test Accounts (7 only)'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Creates the 7 test accounts shown above. Safe to run multiple times.
              </p>
            </div>

            <div>
              <button
                onClick={() => runSeed(true, 'test')}
                disabled={loading}
                className="w-full bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Resetting...' : 'Reset Test Accounts'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Deletes and recreates test accounts with fresh data.
              </p>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Result</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-700">{result.message}</p>
              <ul className="mt-2 text-sm text-green-600">
                {result.instructions?.map((instruction: string, i: number) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Account Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3">Account</th>
                  <th className="text-left py-2 px-3">Use For</th>
                  <th className="text-left py-2 px-3">Has Profile?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">family@test.olera.com</td>
                  <td className="py-2 px-3">Testing family flows (public profile)</td>
                  <td className="py-2 px-3">✓ FamilyProfile</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">family2@test.olera.com</td>
                  <td className="py-2 px-3">Testing private family profile</td>
                  <td className="py-2 px-3">✓ FamilyProfile (private)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">provider@test.olera.com</td>
                  <td className="py-2 px-3">Testing organization provider flows</td>
                  <td className="py-2 px-3">✓ ProviderIdentity (Org)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">caregiver@test.olera.com</td>
                  <td className="py-2 px-3">Testing individual caregiver flows</td>
                  <td className="py-2 px-3">✓ ProviderIdentity (Individual)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">dual@test.olera.com</td>
                  <td className="py-2 px-3">Mode switching without overlay</td>
                  <td className="py-2 px-3">✓ Both profiles</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">newuser@test.olera.com</td>
                  <td className="py-2 px-3">Testing onboarding/empty states</td>
                  <td className="py-2 px-3">✗ None</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">admin@test.olera.com</td>
                  <td className="py-2 px-3">Admin access to seed UI</td>
                  <td className="py-2 px-3">✗ None</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Seeded Engagements</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• family → provider: ACCEPTED ConsultRequest (family engagement)</li>
            <li>• family2 → caregiver: PENDING HiringRequest (family hiring caregiver)</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2 italic">
            Note: Provider-to-provider hiring (org → caregiver, caregiver → org) must be tested manually
            due to schema limitations.
          </p>

          <h3 className="text-md font-semibold text-gray-900 mt-6 mb-3">Unclaimed Provider</h3>
          <p className="text-sm text-gray-600">
            &quot;Golden Years Residence (Unclaimed)&quot; - For testing the claiming flow
          </p>
        </div>
      </div>
    </div>
  );
}
