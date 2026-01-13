'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CareProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard and open profile modal
    router.push('/dashboard?openProfile=true');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Opening profile editor...</div>
    </div>
  );
}
