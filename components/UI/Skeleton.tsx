import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg ${className}`}
      style={{
        animationDuration: '1.5s',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 overflow-hidden">
      {/* Header with avatar */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Tags */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-50 rounded-lg p-3">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Description */}
      <div className="mb-5">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function ProfileCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-14 h-14 rounded-xl bg-white/30" />
            <div>
              <Skeleton className="h-8 w-48 mb-2 bg-white/30" />
              <Skeleton className="h-5 w-64 bg-white/30" />
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Skeleton className="h-8 w-12 mb-2 bg-white/40" />
                <Skeleton className="h-4 w-16 bg-white/40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ProfileCardsSkeleton count={3} />
          </div>
          <div className="space-y-6">
            {/* Sidebar Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 grid grid-cols-4 gap-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-pulse">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
        <div className="flex justify-end gap-4 pt-4">
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
