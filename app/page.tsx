import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Olera
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/providers" className="text-gray-700 hover:text-primary-600">
                Find Care
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">
                About
              </Link>
              <Link href="/for-providers" className="text-gray-700 hover:text-primary-600">
                For Providers
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-primary-600"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-primary-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Elder Care Made Simple
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Find the right care for your loved ones. Connect with trusted providers
                nationwide. One platform, transparent information, human connection.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/providers"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
                >
                  Find Care Providers
                </Link>
                <Link
                  href="/for-providers"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
                >
                  I'm a Provider
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Directory</h3>
              <p className="text-gray-600">
                Browse home care, assisted living, memory care, hospice, and independent caregivers all in one place.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Two-Way Matching</h3>
              <p className="text-gray-600">
                Connect directly with providers who meet your needs. Receive and send consultation requests.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Transparent Communication</h3>
              <p className="text-gray-600">
                Track all conversations, requests, and consultations in one organized dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary-600">For Families</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">1.</span>
                    <span>Create a care profile describing your needs</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">2.</span>
                    <span>Browse providers or wait for matches</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">3.</span>
                    <span>Send or receive consultation requests</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">4.</span>
                    <span>Connect with the right care provider</span>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary-600">For Providers</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">1.</span>
                    <span>Claim or create your provider profile</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">2.</span>
                    <span>Review care profiles in your area</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">3.</span>
                    <span>Respond to requests or reach out proactively</span>
                  </li>
                  <li className="flex">
                    <span className="font-bold text-primary-600 mr-3">4.</span>
                    <span>Connect with families who need your services</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Olera</h4>
              <p className="text-gray-400 text-sm">
                Making elder care simple, transparent, and human.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Families</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/providers">Find Care</Link></li>
                <li><Link href="/how-it-works">How It Works</Link></li>
                <li><Link href="/care-types">Types of Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Providers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/for-providers">Get Listed</Link></li>
                <li><Link href="/claim-profile">Claim Profile</Link></li>
                <li><Link href="/provider-resources">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Olera. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
