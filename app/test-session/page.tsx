"use client";

import { useSession } from "next-auth/react";

export default function TestSessionPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mt-4 space-y-2">
        <p><strong>Email:</strong> {session?.user?.email || 'Not logged in'}</p>
        <p><strong>Name:</strong> {session?.user?.name || 'N/A'}</p>
        <p><strong>Role:</strong> {(session?.user as any)?.role || 'N/A'}</p>
        <p><strong>Active Mode:</strong> {(session?.user as any)?.activeMode || 'N/A'}</p>
        <p><strong>Has Provider Identity:</strong> {String((session?.user as any)?.hasProviderIdentity) || 'N/A'}</p>
      </div>
    </div>
  );
}
