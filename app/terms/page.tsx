"use client";

import { useState, useEffect } from "react";
import MainNav from "@/components/Navigation/MainNav";
import Link from "next/link";

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "services", title: "Our Services" },
    { id: "accounts", title: "User Accounts" },
    { id: "responsibilities", title: "User Responsibilities" },
    { id: "provider-terms", title: "Provider-Specific Terms" },
    { id: "family-terms", title: "Family User Terms" },
    { id: "disclaimers", title: "Disclaimers" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "changes", title: "Changes to Terms" },
    { id: "governing-law", title: "Governing Law" },
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
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Terms of Service
              </h1>
              <p className="text-gray-300 mt-1">
                Last updated: {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <p className="text-gray-300 max-w-3xl">
            Please read these terms carefully before using our services. They outline your rights
            and responsibilities as a user of the Olera platform.
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
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        activeSection === section.id
                          ? "bg-primary-600 text-white"
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
                    href="/privacy"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privacy Policy
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
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">1</span>
                <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Welcome to Olera. These Terms of Service (&quot;Terms&quot;) govern your
                access to and use of Olera&apos;s website, services, and applications
                (collectively, the &quot;Services&quot;). By accessing or using our Services,
                you agree to be bound by these Terms. If you do not agree to these
                Terms, please do not use our Services.
              </p>
            </section>

            {/* Services Description */}
            <section id="services" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">2</span>
                <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Olera provides a platform that connects families seeking senior care
                services with care providers. We facilitate communication and
                information sharing but do not provide care services directly.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-900 font-semibold">Important Notice</p>
                    <p className="text-blue-800 text-sm mt-1">
                      Olera is not a care provider and does not employ caregivers. We
                      are a technology platform that facilitates connections between
                      families and independent care providers.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section id="accounts" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">3</span>
                <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <div className="flex gap-3">
                  <div className="w-1.5 bg-primary-200 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Registration:</strong> You must create an account to use
                    certain features of our Services. You agree to provide accurate,
                    current, and complete information during registration.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 bg-primary-200 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Account Security:</strong> You are responsible for
                    maintaining the confidentiality of your account credentials and for
                    all activities that occur under your account.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 bg-primary-200 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Account Types:</strong> Olera offers two types of
                    accounts: Family accounts (for those seeking care) and Provider
                    accounts (for care service providers).
                  </p>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section id="responsibilities" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">4</span>
                <h2 className="text-2xl font-bold text-gray-900">User Responsibilities</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree to use our Services only for lawful purposes and in
                accordance with these Terms. You agree NOT to:
              </p>
              <div className="bg-gray-50 rounded-xl p-5">
                <ul className="space-y-3 text-gray-600">
                  {[
                    "Provide false or misleading information",
                    "Impersonate any person or entity",
                    "Harass, abuse, or harm other users",
                    "Use the Services for any illegal or unauthorized purpose",
                    "Attempt to gain unauthorized access to our systems",
                    "Interfere with or disrupt the Services",
                    "Collect or store personal data of other users without permission",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Provider-Specific Terms */}
            <section id="provider-terms" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">5</span>
                <h2 className="text-2xl font-bold text-gray-900">Provider-Specific Terms</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <div className="flex gap-3">
                  <div className="w-1.5 bg-emerald-300 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Verification:</strong> Providers must provide accurate
                    information about their services, licenses, certifications, and
                    qualifications. Olera may verify this information but does not
                    guarantee its accuracy.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 bg-emerald-300 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Compliance:</strong> Providers must comply with all
                    applicable laws, regulations, and licensing requirements for their
                    jurisdiction and type of care services.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 bg-emerald-300 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Direct Relationship:</strong> Any agreement for care
                    services is directly between the provider and the family. Olera is
                    not a party to these agreements.
                  </p>
                </div>
              </div>
            </section>

            {/* Family User Terms */}
            <section id="family-terms" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">6</span>
                <h2 className="text-2xl font-bold text-gray-900">Family User Terms</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <div className="flex gap-3">
                  <div className="w-1.5 bg-blue-300 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Due Diligence:</strong> Families are responsible for
                    conducting their own due diligence when evaluating care providers,
                    including verifying licenses, conducting background checks, and
                    checking references.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 bg-blue-300 rounded-full flex-shrink-0"></div>
                  <p className="leading-relaxed">
                    <strong className="text-gray-900">Direct Agreements:</strong> Any care services agreement is
                    directly between you and the provider. You are responsible for all
                    terms, payments, and obligations under such agreements.
                  </p>
                </div>
              </div>
            </section>

            {/* Disclaimers */}
            <section id="disclaimers" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">7</span>
                <h2 className="text-2xl font-bold text-gray-900">Disclaimers</h2>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold uppercase text-sm tracking-wide">Important Legal Notice</span>
                </div>
              </div>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed bg-gray-50 p-4 rounded-lg text-sm">
                  THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
                  NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p className="leading-relaxed">
                  Olera does not guarantee the quality, safety, or legality of
                  services provided by care providers listed on our platform. We do
                  not conduct background checks, verify credentials, or monitor the
                  quality of care provided.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="liability" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">8</span>
                <h2 className="text-2xl font-bold text-gray-900">Limitation of Liability</h2>
              </div>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OLERA SHALL NOT BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
                INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICES.
              </p>
            </section>

            {/* Termination */}
            <section id="termination" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">9</span>
                <h2 className="text-2xl font-bold text-gray-900">Termination</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your account and access
                to the Services at any time, with or without cause, and with or
                without notice. You may also terminate your account at any time by
                contacting us.
              </p>
            </section>

            {/* Changes to Terms */}
            <section id="changes" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">10</span>
                <h2 className="text-2xl font-bold text-gray-900">Changes to These Terms</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We may modify these Terms at any time. We will notify users of any
                material changes by posting the new Terms on this page and updating
                the &quot;Last updated&quot; date. Your continued use of the Services after
                such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section id="governing-law" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">11</span>
                <h2 className="text-2xl font-bold text-gray-900">Governing Law</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the
                laws of the United States, without regard to its conflict of law
                provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section id="contact" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">12</span>
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">legal@olera.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900 font-medium">Olera, Inc., [Address]</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
            <Link
              href="/privacy"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
