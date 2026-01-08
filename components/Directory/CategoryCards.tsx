"use client";

interface Category {
  id: string;
  name: string;
  description: string;
  providerType: string;
  providerCount: number;
  priceRange: string;
  icon: React.ReactNode;
  gradient: string;
}

interface CategoryCardsProps {
  onCategoryClick: (providerType: string) => void;
}

export default function CategoryCards({ onCategoryClick }: CategoryCardsProps) {
  const categories: Category[] = [
    {
      id: "home-care",
      name: "Home Care",
      description: "Professional caregivers providing assistance at home",
      providerType: "HOME_CARE",
      providerCount: 250,
      priceRange: "From $3,000/mo",
      gradient: "from-blue-500 to-blue-600",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "assisted-living",
      name: "Assisted Living",
      description: "Residential communities with 24/7 care and support",
      providerType: "ASSISTED_LIVING",
      providerCount: 180,
      priceRange: "From $4,500/mo",
      gradient: "from-purple-500 to-purple-600",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "memory-care",
      name: "Memory Care",
      description: "Specialized care for Alzheimer's and dementia patients",
      providerType: "MEMORY_CARE",
      providerCount: 95,
      priceRange: "From $6,000/mo",
      gradient: "from-teal-500 to-teal-600",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      id: "independent-living",
      name: "Independent Living",
      description: "Active senior communities with social activities",
      providerType: "INDEPENDENT_LIVING",
      providerCount: 140,
      priceRange: "From $2,500/mo",
      gradient: "from-green-500 to-green-600",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "nursing-home",
      name: "Nursing Homes",
      description: "24/7 skilled nursing and medical care facilities",
      providerType: "NURSING_HOME",
      providerCount: 120,
      priceRange: "From $7,000/mo",
      gradient: "from-red-500 to-red-600",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "hospice",
      name: "Hospice Care",
      description: "Compassionate end-of-life care and support",
      providerType: "HOSPICE",
      providerCount: 75,
      priceRange: "Contact for pricing",
      gradient: "from-indigo-500 to-indigo-600",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore Care Options
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect type of care for your loved one&apos;s needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.providerType)}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left hover-lift"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-br ${category.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <svg
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm opacity-90">{category.description}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Available Providers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {category.providerCount}+
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Starting at</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {category.priceRange}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Click to explore</span>
                    <svg
                      className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
