'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';

export default function HireStaffGetStartedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!session) {
      setAuthModalOpen(true);
      setLoading(false);
      return;
    }

    // Check if user already has a provider profile
    checkProviderProfile();
  }, [session]);

  const checkProviderProfile = async () => {
    try {
      const response = await fetch('/api/providers/me');
      if (response.ok) {
        // User already has a provider profile, redirect to hire staff page
        router.push('/provider/hire-staff');
      } else {
        // No provider profile, show the landing page
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking provider profile:', err);
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Connect with Quality Care Staff
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join Olera's network of care organizations and connect with qualified caregivers actively seeking employment opportunities. Build your team with professionals who are ready to make a difference.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Attract Talent</h3>
            <p className="text-gray-600">
              Your organization profile appears in search results when caregivers browse hiring opportunities. Showcase your mission, culture, and open positions to attract the right candidates.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Receive Applications</h3>
            <p className="text-gray-600">
              Qualified caregivers can express interest directly through the platform. Review applications, view caregiver profiles, and start conversations with potential team members.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Build Your Team</h3>
            <p className="text-gray-600">
              Connect with caregivers who match your needs. Exchange contact information, schedule interviews, and grow your team with professionals committed to quality care.
            </p>
          </div>
        </div>

        {/* What You'll Get Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-10 shadow-sm mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What You'll Get</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Professional Profile Page</h3>
                <p className="text-gray-600">A dedicated profile showcasing your organization, services offered, location, years in operation, and what makes you a great place to work.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Visibility to Active Job Seekers</h3>
                <p className="text-gray-600">Your profile appears when independent caregivers search for hiring organizations, putting you in front of motivated candidates.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Direct Communication</h3>
                <p className="text-gray-600">Built-in messaging system to communicate with interested caregivers, review applications, and coordinate next steps in the hiring process.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Manage Applications</h3>
                <p className="text-gray-600">Track hiring requests in one place, manage conversations with applicants, and organize your recruitment pipeline efficiently.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-10 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Profile</h3>
              <p className="text-sm text-gray-600">Set up your organization profile with details about your services, location, and team culture.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Discovered</h3>
              <p className="text-sm text-gray-600">Caregivers find your profile when browsing hiring organizations on the platform.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Review Applications</h3>
              <p className="text-sm text-gray-600">Receive hiring requests from interested caregivers and review their profiles and qualifications.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect & Hire</h3>
              <p className="text-sm text-gray-600">Start conversations, exchange contact information, and bring qualified caregivers onto your team.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/dashboard/provider-profile"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-lg font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
          >
            Create Your Organization Profile
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Takes less than 5 minutes to set up
          </p>
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          router.push('/');
        }}
        defaultView="login"
      />
    </div>
  );
}
