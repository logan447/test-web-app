"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";

// Care Type Categories with proper icons
const CARE_TYPES = [
  {
    id: "home-care",
    name: "Home Care",
    description: "Non-medical assistance in the comfort of home",
    slug: "HOME_CARE",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "assisted-living",
    name: "Assisted Living",
    description: "Independent living with daily support",
    slug: "ASSISTED_LIVING",
    color: "bg-primary-50 text-primary-600 border-primary-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "memory-care",
    name: "Memory Care",
    description: "Specialized care for dementia and Alzheimer's",
    slug: "MEMORY_CARE",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "nursing-home",
    name: "Nursing Home",
    description: "24/7 skilled nursing and medical care",
    slug: "NURSING_HOME",
    color: "bg-red-50 text-red-600 border-red-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "hospice",
    name: "Hospice Care",
    description: "Compassionate end-of-life comfort care",
    slug: "HOSPICE",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: "respite",
    name: "Respite Care",
    description: "Short-term relief for family caregivers",
    slug: "RESPITE_CARE",
    color: "bg-green-50 text-green-600 border-green-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    quote: "Olera helped us find the perfect memory care facility for my mother. The process was so much easier than we expected.",
    author: "Sarah M.",
    role: "Daughter & Caregiver",
    location: "Houston, TX",
  },
  {
    quote: "As a provider, Olera connects us with families who are a great fit. The platform is intuitive and the leads are high quality.",
    author: "Dr. James Wilson",
    role: "Medical Director",
    location: "Dallas, TX",
  },
  {
    quote: "I was overwhelmed trying to find care for my dad. Olera's matching system found options I never knew existed.",
    author: "Michael R.",
    role: "Son & Family Caregiver",
    location: "Austin, TX",
  },
];

// Stats
const STATS = [
  { value: "500+", label: "Verified Providers" },
  { value: "10,000+", label: "Families Helped" },
  { value: "50+", label: "Texas Cities" },
  { value: "4.8", label: "Average Rating", suffix: "★" },
];

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) {
      const parts = location.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        params.set("city", parts[0]);
        params.set("state", parts[1]);
      } else {
        params.set("city", location);
      }
    }
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <>
      <MainNav />

      {/* Hero Section - Clean and calm design */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Bird logo as brand mark */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Image
                  src="/bird-logo.svg"
                  alt="Olera"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find trusted care for{" "}
              <span className="text-primary-600">your loved ones</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              We help families navigate senior care with confidence. Compare verified providers,
              read real reviews, and connect with the right care options.
            </p>

            {/* Search Form - Prominent and accessible */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
              <div className="flex gap-3 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city or zip code"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-lg shadow-sm bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Find Care
                </button>
              </div>
            </form>

            <p className="text-sm text-gray-500 mb-8">
              Currently available in Texas • Expanding nationwide soon
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Verified Providers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span className="text-sm font-medium">Free to Use</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-1">
                  {stat.value}
                  {stat.suffix && <span className="text-yellow-500">{stat.suffix}</span>}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Care Type */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What type of care are you looking for?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every family&apos;s situation is unique. Explore options to find the right fit for your loved one.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {CARE_TYPES.map((type) => (
              <Link
                key={type.id}
                href={`/browse?type=${type.slug}`}
                className="group p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${type.color} border transition-transform group-hover:scale-105`}>
                  {type.icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1 text-lg">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {type.description}
                </p>
              </Link>
            ))}
          </div>

          {/* View all link */}
          <div className="text-center mt-10">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Browse all providers
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Personalized Care Plan CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-primary-100/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Not sure where to start?
          </h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-xl mx-auto">
            Create a care profile and we&apos;ll match you with providers that fit your loved one&apos;s
            specific needs, budget, and location.
          </p>
          <Link
            href="/care-profile"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Create Your Care Profile
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Free • Takes about 5 minutes • No commitment
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Olera works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Finding the right care doesn&apos;t have to be overwhelming. We make it simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "1",
                title: "Share your needs",
                description: "Tell us about your loved one's care requirements, preferences, and location. Our matching helps narrow down the best options.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Compare options",
                description: "Browse verified providers with photos, reviews, pricing, and availability. Every provider is checked for licensing and credentials.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Connect directly",
                description: "Reach out to schedule tours, ask questions, and find the perfect match. We're with you every step of the way.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-6">
                  {item.icon}
                </div>
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by families across Texas
            </h2>
            <p className="text-gray-600">
              See why thousands of families choose Olera to find care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                {/* Quote icon */}
                <svg className="w-10 h-10 text-primary-100 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Providers CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Are you a care provider?
          </h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            Join Olera to connect with families actively searching for quality care.
            Get verified, build your reputation, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/for-providers"
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Learn More
            </Link>
            <Link
              href="/signup?intent=provider"
              className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              List Your Services
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your trust is our priority
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Verified Providers",
                description: "Every provider is checked for licensing, insurance, and credentials",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Secure & Private",
                description: "Your information is protected with enterprise-grade security",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
                title: "Real Reviews",
                description: "Authentic reviews from families help you make informed decisions",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: "Always Here to Help",
                description: "Our care advisors are available to guide you through the process",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/bird-logo.svg"
                  alt="Olera"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-white">Olera</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Helping families find quality senior care with confidence.
                We believe every family deserves access to compassionate,
                qualified care for their loved ones.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Families</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/browse" className="hover:text-white transition-colors">Find Care</Link></li>
                <li><Link href="/browse?type=ASSISTED_LIVING" className="hover:text-white transition-colors">Assisted Living</Link></li>
                <li><Link href="/browse?type=MEMORY_CARE" className="hover:text-white transition-colors">Memory Care</Link></li>
                <li><Link href="/browse?type=HOME_CARE" className="hover:text-white transition-colors">Home Care</Link></li>
                <li><Link href="/care-profile" className="hover:text-white transition-colors">Create Care Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Providers</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/for-providers" className="hover:text-white transition-colors">Why Olera</Link></li>
                <li><Link href="/signup?intent=provider" className="hover:text-white transition-colors">List Your Services</Link></li>
                <li><Link href="/provider/leads" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Olera. All rights reserved.</p>
            <p className="text-xs text-gray-500">Made with care in Texas</p>
          </div>
        </div>
      </footer>
    </>
  );
}
