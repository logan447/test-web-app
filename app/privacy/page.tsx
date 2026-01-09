import MainNav from "@/components/Navigation/MainNav";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Olera's Privacy Policy. This policy describes how Olera
              ("we," "us," or "our") collects, uses, shares, and protects your
              personal information when you use our platform and services. We are
              committed to protecting your privacy and being transparent about our
              data practices.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Information We Collect
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  2.1 Information You Provide
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    <strong>Account Information:</strong> Name, email address,
                    phone number, password
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Care needs, location,
                    budget, timeline, preferences
                  </li>
                  <li>
                    <strong>Provider Information:</strong> Business name, license
                    numbers, certifications, services offered, photos
                  </li>
                  <li>
                    <strong>Communications:</strong> Messages, consultation
                    requests, and other communications through our platform
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  2.2 Information Collected Automatically
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>
                    <strong>Usage Data:</strong> Pages viewed, features used,
                    time spent on the platform
                  </li>
                  <li>
                    <strong>Device Information:</strong> IP address, browser type,
                    device type, operating system
                  </li>
                  <li>
                    <strong>Location Data:</strong> General location based on IP
                    address
                  </li>
                  <li>
                    <strong>Cookies:</strong> We use cookies and similar tracking
                    technologies (see Section 7)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide, maintain, and improve our Services</li>
              <li>
                Facilitate connections between families and care providers
              </li>
              <li>Process and manage consultation requests</li>
              <li>Send you service-related notifications and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect, prevent, and address fraud and security issues</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>
                Send marketing communications (with your consent, where required)
              </li>
            </ul>
          </section>

          {/* How We Share Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. How We Share Your Information
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  4.1 With Other Users
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  When you send a consultation request or message, we share your
                  profile information with the recipient to facilitate the
                  connection. Families can see provider profiles, and providers can
                  see limited family profile information when a request is made.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  4.2 With Service Providers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We may share your information with third-party service providers
                  who help us operate our platform, such as hosting providers,
                  analytics services, and payment processors.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  4.3 For Legal Reasons
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose your information if required by law or in
                  response to valid legal requests, such as court orders or
                  subpoenas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  4.4 Business Transfers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your
                  information may be transferred to the acquiring entity.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-blue-900 font-medium">We Do Not Sell Your Data</p>
                <p className="text-blue-800 text-sm mt-2">
                  Olera does not sell your personal information to third parties
                  for their marketing purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access, loss,
              misuse, or alteration. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure password hashing</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure hosting infrastructure</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure.
              We cannot guarantee absolute security of your information.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as your account is
              active or as needed to provide you with our Services. We will also
              retain and use your information as necessary to comply with legal
              obligations, resolve disputes, and enforce our agreements. When you
              delete your account, we will delete or anonymize your personal
              information within 90 days, except where we are required to retain it
              for legal purposes.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze how you use our platform</li>
              <li>Provide personalized content and ads</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookies through your browser settings. However,
              disabling cookies may affect your ability to use certain features of
              our Services.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Your Privacy Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data to
                another service
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from marketing
                communications
              </li>
              <li>
                <strong>Object:</strong> Object to certain processing of your data
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, please contact us at privacy@olera.com.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Services are not intended for children under 18 years of age. We
              do not knowingly collect personal information from children under 18.
              If you believe we have collected information from a child under 18,
              please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. International Users
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Services are operated in the United States. If you are located
              outside the United States, please be aware that information we
              collect will be transferred to and processed in the United States.
              By using our Services, you consent to the transfer of your
              information to the United States.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify
              you of any material changes by posting the new Privacy Policy on this
              page and updating the "Last updated" date. We encourage you to review
              this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@olera.com
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Address:</strong> Olera, Inc., [Address]
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Data Protection Officer:</strong> dpo@olera.com
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link
            href="/terms"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Terms of Service
          </Link>
          <span className="text-gray-400 mx-3">•</span>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
