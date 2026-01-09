import MainNav from "@/components/Navigation/MainNav";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
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
              Welcome to Olera. These Terms of Service (&quot;Terms&quot;) govern your
              access to and use of Olera&apos;s website, services, and applications
              (collectively, the &quot;Services&quot;). By accessing or using our Services,
              you agree to be bound by these Terms. If you do not agree to these
              Terms, please do not use our Services.
            </p>
          </section>

          {/* Services Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Our Services
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Olera provides a platform that connects families seeking senior care
              services with care providers. We facilitate communication and
              information sharing but do not provide care services directly.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-blue-900 font-medium">Important Notice:</p>
              <p className="text-blue-800 text-sm mt-2">
                Olera is not a care provider and does not employ caregivers. We
                are a technology platform that facilitates connections between
                families and independent care providers.
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Accounts
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>Registration:</strong> You must create an account to use
                certain features of our Services. You agree to provide accurate,
                current, and complete information during registration.
              </p>
              <p className="leading-relaxed">
                <strong>Account Security:</strong> You are responsible for
                maintaining the confidentiality of your account credentials and for
                all activities that occur under your account.
              </p>
              <p className="leading-relaxed">
                <strong>Account Types:</strong> Olera offers two types of
                accounts: Family accounts (for those seeking care) and Provider
                accounts (for care service providers).
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. User Responsibilities
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                You agree to use our Services only for lawful purposes and in
                accordance with these Terms. You agree NOT to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide false or misleading information</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>
                  Use the Services for any illegal or unauthorized purpose
                </li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Services</li>
                <li>
                  Collect or store personal data of other users without
                  permission
                </li>
              </ul>
            </div>
          </section>

          {/* Provider-Specific Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Provider-Specific Terms
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>Verification:</strong> Providers must provide accurate
                information about their services, licenses, certifications, and
                qualifications. Olera may verify this information but does not
                guarantee its accuracy.
              </p>
              <p className="leading-relaxed">
                <strong>Compliance:</strong> Providers must comply with all
                applicable laws, regulations, and licensing requirements for their
                jurisdiction and type of care services.
              </p>
              <p className="leading-relaxed">
                <strong>Direct Relationship:</strong> Any agreement for care
                services is directly between the provider and the family. Olera is
                not a party to these agreements.
              </p>
            </div>
          </section>

          {/* Family User Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Family User Terms
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>Due Diligence:</strong> Families are responsible for
                conducting their own due diligence when evaluating care providers,
                including verifying licenses, conducting background checks, and
                checking references.
              </p>
              <p className="leading-relaxed">
                <strong>Direct Agreements:</strong> Any care services agreement is
                directly between you and the provider. You are responsible for all
                terms, payments, and obligations under such agreements.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Disclaimers
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded mb-4">
              <p className="text-yellow-900 font-medium uppercase text-sm">
                Important Legal Notice
              </p>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
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
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, OLERA SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
              DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICES.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account and access
              to the Services at any time, with or without cause, and with or
              without notice. You may also terminate your account at any time by
              contacting us.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Changes to These Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms at any time. We will notify users of any
              material changes by posting the new Terms on this page and updating
              the &quot;Last updated&quot; date. Your continued use of the Services after
              such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the
              laws of the United States, without regard to its conflict of law
              provisions.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@olera.com
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Address:</strong> Olera, Inc., [Address]
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link
            href="/privacy"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Privacy Policy
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
