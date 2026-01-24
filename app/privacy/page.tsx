"use client";

import { useState, useEffect } from "react";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information-collected", title: "Information We Collect" },
    { id: "how-we-use", title: "How We Use Your Information" },
    { id: "sharing", title: "How We Share Your Information" },
    { id: "security", title: "Data Security" },
    { id: "retention", title: "Data Retention" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "rights", title: "Your Privacy Rights" },
    { id: "children", title: "Children's Privacy" },
    { id: "international", title: "International Users" },
    { id: "changes", title: "Changes to Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Privacy Policy
              </h1>
              <p className="text-indigo-200 mt-1">
                Last updated: {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <p className="text-indigo-200 max-w-3xl">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information
            when you use the Olera platform.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Contents
                </h2>
                <nav className="space-y-1">
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === section.id
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        activeSection === section.id
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {index + 1}
                      </span>
                      {section.title}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href="/terms"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10 space-y-10">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">1</span>
                <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Welcome to Olera&apos;s Privacy Policy. This policy describes how Olera
                (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, shares, and protects your
                personal information when you use our platform and services. We are
                committed to protecting your privacy and being transparent about our
                data practices.
              </p>
            </section>

            {/* Information We Collect */}
            <section id="information-collected" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">2</span>
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Information You Provide
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    {[
                      { label: "Account Information", desc: "Name, email address, phone number, password" },
                      { label: "Profile Information", desc: "Care needs, location, budget, timeline, preferences" },
                      { label: "Provider Information", desc: "Business name, license numbers, certifications, services offered, photos" },
                      { label: "Communications", desc: "Messages, consultation requests, and other communications through our platform" },
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="text-gray-900">{item.label}:</strong> {item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Information Collected Automatically
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    {[
                      { label: "Usage Data", desc: "Pages viewed, features used, time spent on the platform" },
                      { label: "Device Information", desc: "IP address, browser type, device type, operating system" },
                      { label: "Location Data", desc: "General location based on IP address" },
                      { label: "Cookies", desc: "We use cookies and similar tracking technologies (see Section 7)" },
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="text-gray-900">{item.label}:</strong> {item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section id="how-we-use" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">3</span>
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Provide, maintain, and improve our Services",
                  "Facilitate connections between families and care providers",
                  "Process and manage consultation requests",
                  "Send you service-related notifications",
                  "Respond to inquiries and provide support",
                  "Detect, prevent, and address fraud",
                  "Comply with legal obligations",
                  "Analyze usage to improve experience",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* How We Share Your Information */}
            <section id="sharing" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">4</span>
                <h2 className="text-2xl font-bold text-gray-900">How We Share Your Information</h2>
              </div>

              <div className="space-y-4">
                {[
                  { title: "With Other Users", desc: "When you send a consultation request or message, we share your profile information with the recipient to facilitate the connection." },
                  { title: "With Service Providers", desc: "We may share your information with third-party service providers who help us operate our platform." },
                  { title: "For Legal Reasons", desc: "We may disclose your information if required by law or in response to valid legal requests." },
                  { title: "Business Transfers", desc: "In the event of a merger, acquisition, or sale of assets, your information may be transferred." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-1.5 bg-indigo-300 rounded-full flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-emerald-900 font-semibold">We Do Not Sell Your Data</p>
                      <p className="text-emerald-800 text-sm mt-1">
                        Olera does not sell your personal information to third parties for their marketing purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section id="security" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">5</span>
                <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Encryption of data in transit and at rest" },
                  { icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", text: "Secure password hashing" },
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Regular security assessments" },
                  { icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Access controls and authentication" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-4 italic">
                Note: No method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information.
              </p>
            </section>

            {/* Data Retention */}
            <section id="retention" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">6</span>
                <h2 className="text-2xl font-bold text-gray-900">Data Retention</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal information for as long as your account is
                active or as needed to provide you with our Services. We will also
                retain and use your information as necessary to comply with legal
                obligations, resolve disputes, and enforce our agreements. When you
                delete your account, we will delete or anonymize your personal
                information within <strong className="text-gray-900">90 days</strong>, except where we are required to retain it
                for legal purposes.
              </p>
            </section>

            {/* Cookies */}
            <section id="cookies" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">7</span>
                <h2 className="text-2xl font-bold text-gray-900">Cookies and Tracking Technologies</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Keep you logged in",
                    "Remember your preferences",
                    "Analyze how you use our platform",
                    "Provide personalized content",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can control cookies through your browser settings. However,
                disabling cookies may affect your ability to use certain features.
              </p>
            </section>

            {/* Your Rights */}
            <section id="rights" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">8</span>
                <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z", title: "Access", desc: "Request a copy of your personal information" },
                  { icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", title: "Correction", desc: "Request correction of inaccurate information" },
                  { icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", title: "Deletion", desc: "Request deletion of your personal information" },
                  { icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", title: "Portability", desc: "Request transfer of your data to another service" },
                  { icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", title: "Opt-Out", desc: "Unsubscribe from marketing communications" },
                  { icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", title: "Object", desc: "Object to certain processing of your data" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-indigo-100 p-2 rounded-lg h-fit">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mt-4">
                To exercise these rights, please contact us at <span className="font-medium text-indigo-600">privacy@olera.com</span>.
              </p>
            </section>

            {/* Children's Privacy */}
            <section id="children" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">9</span>
                <h2 className="text-2xl font-bold text-gray-900">Children&apos;s Privacy</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Our Services are not intended for children under 18 years of age. We
                do not knowingly collect personal information from children under 18.
                If you believe we have collected information from a child under 18,
                please contact us immediately.
              </p>
            </section>

            {/* International Users */}
            <section id="international" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">10</span>
                <h2 className="text-2xl font-bold text-gray-900">International Users</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Our Services are operated in the United States. If you are located
                outside the United States, please be aware that information we
                collect will be transferred to and processed in the United States.
                By using our Services, you consent to the transfer of your
                information to the United States.
              </p>
            </section>

            {/* Changes to Policy */}
            <section id="changes" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">11</span>
                <h2 className="text-2xl font-bold text-gray-900">Changes to This Privacy Policy</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify
                you of any material changes by posting the new Privacy Policy on this
                page and updating the &quot;Last updated&quot; date. We encourage you to review
                this Privacy Policy periodically.
              </p>
            </section>

            {/* Contact Information */}
            <section id="contact" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">12</span>
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                <div className="space-y-4">
                  {[
                    { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Email", value: "privacy@olera.com" },
                    { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", label: "Address", value: "Olera, Inc., [Address]" },
                    { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Data Protection Officer", value: "dpo@olera.com" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-gray-900 font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
