export default function ProviderDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="h-10 w-3/4 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
            <div className="h-5 w-2/3 bg-gray-200 rounded mb-6"></div>

            {/* Badges skeleton */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
              ))}
            </div>

            {/* Rating skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Photo Gallery skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 row-span-2 h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-30 bg-gray-200 rounded-lg"></div>
              <div className="h-30 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="h-7 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Pricing skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="h-7 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 w-48 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>

          {/* Care types skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="h-7 w-56 bg-gray-200 rounded mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-32 bg-gray-200 rounded-full"></div>
              ))}
            </div>
          </div>

          {/* Sections skeleton */}
          {[1, 2, 3].map((section) => (
            <div key={section} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="h-7 w-56 bg-gray-200 rounded mb-6"></div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="h-7 w-40 bg-gray-200 rounded mb-6"></div>

              {/* CTA buttons skeleton */}
              <div className="space-y-3">
                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
              </div>

              <div className="h-4 w-full bg-gray-200 rounded mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
