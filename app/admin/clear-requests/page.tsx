'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';

export default function ClearRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleClear = async () => {
    if (!confirm('Are you sure you want to delete ALL consultation requests? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/clear-requests', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        showToast.success('All consultation requests cleared!');
      } else {
        showToast.error(data.error || 'Failed to clear requests');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Failed to clear requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Clear Consultation Requests
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> This will permanently delete all consultation requests
            and their messages from the database. This action cannot be undone!
          </p>
        </div>

        <button
          onClick={handleClear}
          disabled={loading}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Clearing...' : 'Clear All Requests'}
        </button>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 font-medium">Success!</p>
            <p className="text-sm text-green-700 mt-2">
              Deleted {result.deletedRequests} consultation requests and {result.deletedMessages} messages
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full mt-4 bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
