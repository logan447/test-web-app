import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ animationDuration: '1.5s' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-start gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Care Types */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}

export function ProfileCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
