import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
          <div className="flex justify-center">
            <svg
              className="w-32 h-32 text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        {/* Navigation Options */}
        <div className="space-y-4 mb-8">
          <Link
            href="/"
            className="block w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <span className="inline-flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go to Homepage
            </span>
          </Link>

          <Link
            href="/search"
            className="block w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <span className="inline-flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search Providers
            </span>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-4">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/messages"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Messages
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/profile"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Profile
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/help"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Help
            </Link>
          </div>
        </div>

        {/* Olera Branding */}
        <div className="mt-12 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors font-semibold">
            Olera
          </Link>
          {" · Elder Care Made Simple"}
        </div>
      </div>
    </div>
  );
}
