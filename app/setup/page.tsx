'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const createAdmin = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/setup', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage('Admin account created! You can now log in.');
      } else {
        setStatus('error');
        setMessage(data.error?.message || 'Failed to create admin');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to connect to API');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Initial Setup</h1>

        {status === 'success' ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">{message}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2"><strong>Login credentials:</strong></p>
              <p className="font-mono text-sm">Email: admin@test.olera.com</p>
              <p className="font-mono text-sm">Password: test1234!</p>
            </div>
            <a
              href="/login"
              className="block w-full bg-primary-600 text-white text-center px-4 py-3 rounded-lg font-medium hover:bg-primary-700"
            >
              Go to Login
            </a>
          </div>
        ) : status === 'error' ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{message}</p>
            </div>
            {message.includes('already exists') && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2"><strong>Login credentials:</strong></p>
                <p className="font-mono text-sm">Email: admin@test.olera.com</p>
                <p className="font-mono text-sm">Password: test1234!</p>
              </div>
            )}
            <a
              href="/login"
              className="block w-full bg-primary-600 text-white text-center px-4 py-3 rounded-lg font-medium hover:bg-primary-700"
            >
              Go to Login
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Click the button below to create the initial admin account.
            </p>
            <button
              onClick={createAdmin}
              disabled={status === 'loading'}
              className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400"
            >
              {status === 'loading' ? 'Creating...' : 'Create Admin Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
