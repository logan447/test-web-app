'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeedDatabasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-database', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to seed database');
      }
    } catch (err) {
      setError('An error occurred while seeding the database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Seed Test Database
        </h1>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-900">
            <strong>⚠️ Warning:</strong> This will create test accounts in the database. Only use this for testing Sprint 0.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            What will be created:
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Family Account:</strong> family.test@demo.com (password: demo123)</span>
            </li>
            <li className="flex items-start gap-2 ml-6 text-sm text-gray-600">
              • Profile: Needs Memory Care in San Diego
            </li>
            <li className="flex items-start gap-2 mt-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Provider Account:</strong> provider.test@demo.com (password: demo123)</span>
            </li>
            <li className="flex items-start gap-2 ml-6 text-sm text-gray-600">
              • Profile: Sunny Hills Memory Care in San Diego
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            How to test matching:
          </h2>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
            <li>Click "Seed Database" below</li>
            <li>Log in as family.test@demo.com (password: demo123)</li>
            <li>Browse providers → Should see "Your Matches" with Sunny Hills</li>
            <li>Log out, then log in as provider.test@demo.com</li>
            <li>Browse families → Should see "Your Matches" with Test Family</li>
          </ol>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <h3 className="text-green-900 font-semibold mb-2">
              ✅ Database seeded successfully!
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              {result.accounts?.map((account: any, i: number) => (
                <div key={i} className="bg-white bg-opacity-50 rounded p-2">
                  <p><strong>Email:</strong> {account.email}</p>
                  <p><strong>Password:</strong> {account.password}</p>
                  <p><strong>Type:</strong> {account.type}</p>
                  <p><strong>Profile:</strong> {account.profile}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Seeding Database...' : 'Seed Database'}
          </button>

          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium border-2 border-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        {result && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Go to Login Page →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
