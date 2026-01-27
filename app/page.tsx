"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import { LocationAutocomplete } from "@/components/Location";

// Care services options for search
const CARE_SERVICE_OPTIONS = [
  { value: "", label: "Any service" },
  { value: "COMPANION_CARE", label: "Companion Care" },
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "HOSPICE_CARE", label: "Hospice Care" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "LIVE_IN_CARE", label: "Live-in Care" },
];

// Care entry options - situation-based language that reflects how people experience the journey
const CARE_TYPES = [
  {
    id: "help-at-home",
    name: "Help at Home",
    description: "Stay independent with support in your own space",
    slug: "HOME_CARE",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "after-hospital",
    name: "After a Hospital Stay",
    description: "Find rehab or recovery care nearby",
    slug: "REHABILITATION",
    color: "bg-green-50 text-green-600 border-green-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "memory-concerns",
    name: "Memory Concerns",
    description: "Specialized care for memory or safety needs",
    slug: "MEMORY_CARE",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "planning-ahead",
    name: "Planning Ahead",
    description: "Explore options before you need them",
    slug: "ASSISTED_LIVING",
    color: "bg-primary-50 text-primary-600 border-primary-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "long-term-care",
    name: "Long-term Options",
    description: "24/7 nursing or assisted living communities",
    slug: "NURSING_HOME",
    color: "bg-red-50 text-red-600 border-red-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "end-of-life",
    name: "Comfort Care",
    description: "Compassionate hospice and palliative support",
    slug: "HOSPICE",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

// Testimonials - real, emotional stories from families across the US
const TESTIMONIALS = [
  {
    quote: "After Dad's stroke, I was overwhelmed. Olera helped us find a rehab center that got him walking again. They made a scary time less scary.",
    author: "Sarah M.",
    role: "Daughter",
    location: "Arizona",
  },
  {
    quote: "Mom needed memory care but wouldn't leave her neighborhood. We found a place 10 minutes away. She's thriving and I visit every day.",
    author: "Michael R.",
    role: "Son",
    location: "California",
  },
  {
    quote: "I didn't know where to start. Olera showed me options I never knew existed. Now Dad has help at home and keeps his independence.",
    author: "Jennifer L.",
    role: "Daughter",
    location: "Florida",
  },
];

// Featured care categories - each links to a filtered browse page
const FEATURED_CARE_CATEGORIES = [
  {
    label: "Featured Home Care",
    type: "HOME_CARE",
    color: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
    description: "Caregivers who come to your home",
  },
  {
    label: "Featured Assisted Living",
    type: "ASSISTED_LIVING",
    color: "bg-green-50 border-green-100",
    iconColor: "text-green-600",
    description: "Communities with daily living support",
  },
  {
    label: "Featured Memory Care",
    type: "MEMORY_CARE",
    color: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-600",
    description: "Specialized care for Alzheimer's and dementia",
  },
  {
    label: "Featured Nursing Homes",
    type: "NURSING_HOME",
    color: "bg-red-50 border-red-100",
    iconColor: "text-red-600",
    description: "24/7 skilled nursing and medical care",
  },
];

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; state: string } | null>(null);
  const [careType, setCareType] = useState("");
  const [careService, setCareService] = useState("");
  const handleLocationChange = (value: string, loc?: { city: string; state: string }) => {
    setLocation(value);
    if (loc) {
      setSelectedLocation({ city: loc.city, state: loc.state });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (selectedLocation) {
      params.set("city", selectedLocation.city);
      params.set("state", selectedLocation.state);
    } else if (location) {
      // Fallback: try to parse "City, State" format
      const parts = location.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        params.set("city", parts[0]);
        params.set("state", parts[1]);
      } else {
        params.set("city", location);
      }
    }

    if (careType) {
      params.set("type", careType);
    }
    if (careService) {
      params.set("care", careService);
    }

    router.push(`/browse?${params.toString()}`);
  };

  return (
    <>
      <MainNav />

      {/* Hero Section - Emotionally resonant for families seeking care */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8 lg:pt-20 lg:pb-12">
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline - plain language for 65+ families seeking care */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find trusted senior care near you
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Whether you need help at home, assisted living, memory care, or a nursing home — search, compare, and connect with verified care options in your area.
            </p>

            {/* Search Form - Integrated LocationAutocomplete */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
                <div className="flex flex-col md:flex-row md:items-center md:divide-x divide-gray-200">
                  {/* Location with Autocomplete */}
                  <div className="flex-1 px-4 py-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Where</label>
                    <LocationAutocomplete
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="Enter city"
                      showIcon={false}
                      inputClassName="border-0 p-0 focus:ring-0 text-base text-center"
                      className="w-full"
                    />
                  </div>

                  {/* Provider Type */}
                  <div className="flex-1 px-4 py-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Type of Care</label>
                    <select
                      value={careType}
                      onChange={(e) => setCareType(e.target.value)}
                      className="w-full text-gray-900 focus:outline-none text-base bg-transparent appearance-none cursor-pointer text-center"
                    >
                      <option value="">Any type</option>
                      {CARE_TYPES.map((type) => (
                        <option key={type.id} value={type.slug}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Care Services */}
                  <div className="flex-1 px-4 py-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Care Services</label>
                    <select
                      value={careService}
                      onChange={(e) => setCareService(e.target.value)}
                      className="w-full text-gray-900 focus:outline-none text-base bg-transparent appearance-none cursor-pointer text-center"
                    >
                      {CARE_SERVICE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Button */}
                  <div className="px-2 py-2 md:py-0">
                    <button
                      type="submit"
                      className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Trust signals - simplified */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified providers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>Real reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Types of Care - Category cards that explain what each type means */}
      <section className="pt-8 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Explore types of senior care
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Not sure what kind of care you need? Start here to learn what&apos;s available.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_CARE_CATEGORIES.map((cat) => (
              <Link
                key={cat.type}
                href={`/browse?type=${cat.type}`}
                className={`group rounded-xl border p-6 hover:shadow-lg hover:border-primary-200 transition-all ${cat.color}`}
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {cat.label}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {cat.description}
                </p>
                <span className="text-sm font-medium text-primary-600 flex items-center gap-1">
                  Browse options
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Care Type */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              What best describes your situation?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Choose a starting point and we&apos;ll help you explore the right options.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CARE_TYPES.map((type) => (
              <Link
                key={type.id}
                href={`/browse?type=${type.slug}`}
                className="group p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${type.color} border transition-transform group-hover:scale-105`}>
                  {type.icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {type.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guidance Section - For unsure users */}
      <section className="py-12 bg-primary-50 border-y border-primary-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Not sure where to start?
              </h2>
              <p className="text-gray-600">
                Tell us about your loved one&apos;s situation and we&apos;ll suggest care options that fit — whether they need help at home, a safe community, or something in between.
              </p>
            </div>
            <Link
              href="/care-profile/edit"
              className="shrink-0 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all"
            >
              Help me find care
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Search by location and care type",
                description: "Find verified options near you with reviews and pricing.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Save 3-5 options and reach out",
                description: "Contact your favorites to ask questions and share your family's needs.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Visit, compare, and choose",
                description: "Schedule visits with your top choices and pick the best fit for your loved one.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Families like yours found care they trust
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Providers CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Are you a care provider?
          </h2>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            Join Olera to connect with families looking for care.
            Get verified, build your reputation, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/for-providers"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Learn more
            </Link>
            <Link
              href="/signup?intent=provider"
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              List your services
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </>
  );
}
