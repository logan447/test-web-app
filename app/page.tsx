"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";

// Words for typewriter effect
const TYPEWRITER_WORDS = [
  "nursing homes",
  "assisted living",
  "home care",
  "memory care",
  "hospice care",
  "caregivers",
];

// Care Type Categories
const CARE_TYPES = [
  { id: "home-care", name: "Home Care (Non-medical)", slug: "HOME_CARE" },
  { id: "home-care-medical", name: "Home Care (Medical)", slug: "HOME_CARE_MEDICAL" },
  { id: "assisted-living", name: "Assisted Living", slug: "ASSISTED_LIVING" },
  { id: "memory-care", name: "Memory Care", slug: "MEMORY_CARE" },
  { id: "nursing-home", name: "Nursing Home", slug: "NURSING_HOME" },
  { id: "hospice", name: "Hospice", slug: "HOSPICE" },
  { id: "independent-living", name: "Independent Living", slug: "INDEPENDENT_LIVING" },
];

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const word = TYPEWRITER_WORDS[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < word.length) {
          setDisplayText(word.slice(0, displayText.length + 1));
        } else {
          // Pause at end of word
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(word.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex]);

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

      {/* Hero Section */}
      <section className="relative bg-cream-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 min-h-[500px] lg:min-h-[560px]">
            {/* Left Content */}
            <div className="flex flex-col justify-center px-6 lg:px-12 py-12 lg:py-16">
              <p className="text-gray-600 text-lg mb-3">
                Are you caring for an elder loved one?
              </p>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                Connect with trusted
              </h1>
              <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-8 h-14">
                {displayText}
                <span className="animate-pulse">|</span>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City or zip code
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Get started
                  </button>
                </div>
              </form>

              <p className="text-sm text-gray-500 mb-8">
                Olera is currently available in the state of Texas but we&apos;re working
                around the clock to be able to help you wherever you are in US.
              </p>

              {/* NIH Badge */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Proudly supported by</span>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-bold text-blue-800">NIH</span>
                  <span className="text-gray-700">National Institute on Aging</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200">
                <Image
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80"
                  alt="Elderly person with caregiver"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* NIH Badge overlay on image */}
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Proudly supported by</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-blue-800">NIH</span>
                    <span className="text-gray-700 text-xs">National Institute on Aging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Personalized Care Plan CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get a personalized care plan
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Let us know more about your caregiving situation by answering a few questions and we
            will find best match for your needs.
          </p>
          <Link
            href="/care-profile"
            className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Browse by Care Type */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Browse by care type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CARE_TYPES.map((type) => (
              <Link
                key={type.id}
                href={`/browse?type=${type.slug}`}
                className="group p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Find providers
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How Olera Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Search & Compare",
                description: "Browse care providers in your area. Filter by type, location, and services to find the perfect match.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Connect Directly",
                description: "Reach out to providers you&apos;re interested in. Schedule tours, ask questions, and get personalized information.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Make Informed Decisions",
                description: "Read reviews from real families, compare pricing, and choose the best care option with confidence.",
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find the Right Care?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of families who found quality care through Olera.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse Providers
            </Link>
            <Link
              href="/for-providers"
              className="px-8 py-4 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-colors border border-primary-500"
            >
              List Your Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">Olera</div>
              <p className="text-sm">
                Helping families find quality senior care since 2024.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Families</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse" className="hover:text-white">Browse Providers</Link></li>
                <li><Link href="/browse?type=ASSISTED_LIVING" className="hover:text-white">Assisted Living</Link></li>
                <li><Link href="/browse?type=MEMORY_CARE" className="hover:text-white">Memory Care</Link></li>
                <li><Link href="/browse?type=HOME_CARE" className="hover:text-white">Home Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Providers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/for-providers" className="hover:text-white">List Your Services</Link></li>
                <li><Link href="/provider/leads" className="hover:text-white">Provider Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © {new Date().getFullYear()} Olera. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
