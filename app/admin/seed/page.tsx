'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SeedAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [secret, setSecret] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  const runSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🌱 Database Seeding Tool
          </h1>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-6">
            <p className="text-yellow-900 font-medium">⚠️ Warning</p>
            <p className="text-yellow-800 text-sm mt-1">
              This will DELETE all existing data and create fresh demo data.
              Only use this in development/staging environments!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seed Secret (optional - set SEED_SECRET in env)
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Leave empty if not configured"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={runSeed}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? '🌱 Seeding Database...' : '▶️ Run Seed Script'}
            </button>
          </div>

          {result && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Result:</h2>
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              What will be created:
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>👤 19 users (12 families, 7 providers)</li>
              <li>🏥 30 providers across all care types</li>
              <li>👨‍👩‍👧 12 family profiles with diverse scenarios</li>
              <li>💬 13 consultation requests</li>
              <li>📨 25+ messages in conversations</li>
              <li>📅 3 tour appointments</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              All passwords: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
