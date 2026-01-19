'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Bootstrap page for creating the initial admin account
 * This only works when no admin accounts exist in the database
 */
export default function BootstrapPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if bootstrap is available on load
  useEffect(() => {
    checkBootstrapStatus();
  }, []);

  const checkBootstrapStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/admin/bootstrap');
      const data = await response.json();

      if (data.success) {
        setBootstrapAvailable(data.data.bootstrapAvailable);
      }
    } catch (err) {
      setError('Failed to check bootstrap status');
    } finally {
      setChecking(false);
    }
  };

  const runBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setBootstrapAvailable(false);
      } else {
        setError(data.error?.message || 'Bootstrap failed');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Checking bootstrap status...</p>
      </div>
    );
  }

  // Bootstrap not available
  if (!bootstrapAvailable && !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Bootstrap Not Available
          </h1>
          <p className="text-gray-600 mb-4">
            An admin account already exists. Bootstrap is disabled for security.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
          <div className="text-4xl mb-4 text-center">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Admin Account Created
          </h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700 mb-2">
              <strong>Email:</strong> {result.admin.email}
            </p>
            <p className="text-sm text-green-700 mb-2">
              <strong>Name:</strong> {result.admin.name}
            </p>
            <p className="text-sm text-green-700">
              <strong>Temporary Password:</strong>
            </p>
            <code className="block mt-1 bg-green-100 p-2 rounded text-green-800 font-mono text-lg">
              {result.temporaryPassword}
            </code>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-700 font-medium mb-2">
              ⚠️ Important: Save this password now!
            </p>
            <p className="text-sm text-yellow-700">
              This password will not be shown again. Change it after logging in.
            </p>
          </div>

          <ol className="text-sm text-gray-600 mb-4 list-decimal list-inside space-y-1">
            {result.instructions.map((instruction: string, i: number) => (
              <li key={i}>{instruction}</li>
            ))}
          </ol>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Bootstrap form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <div className="text-4xl mb-4 text-center">🚀</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
          Create Admin Account
        </h1>
        <p className="text-gray-600 mb-6 text-center text-sm">
          No admin account exists. Create the first admin to get started.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={runBootstrap} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourcompany.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !name}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          A temporary password will be generated. Save it securely.
        </p>
      </div>
    </div>
  );
}
