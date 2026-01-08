export default function ProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 skeleton"></div>

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 skeleton"></div>

        {/* Provider Type */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 skeleton"></div>

        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 skeleton"></div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-gray-200 rounded skeleton"></div>
          <div className="h-4 bg-gray-200 rounded w-16 skeleton"></div>
          <div className="h-4 bg-gray-200 rounded w-24 skeleton"></div>
        </div>

        {/* Pricing */}
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-3 skeleton"></div>

        {/* Amenities Pills */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-20 bg-gray-200 rounded skeleton"></div>
          <div className="h-6 w-24 bg-gray-200 rounded skeleton"></div>
          <div className="h-6 w-20 bg-gray-200 rounded skeleton"></div>
        </div>

        {/* Trust Badges */}
        <div className="flex gap-2 mb-3">
          <div className="h-4 w-16 bg-gray-200 rounded skeleton"></div>
          <div className="h-4 w-16 bg-gray-200 rounded skeleton"></div>
          <div className="h-4 w-16 bg-gray-200 rounded skeleton"></div>
        </div>

        {/* Button */}
        <div className="pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24 skeleton"></div>
        </div>
      </div>
    </div>
  );
}
