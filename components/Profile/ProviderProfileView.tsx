'use client';

interface ProviderProfile {
  id: string;
  providerType: string;
  name: string;
  careTypesOffered: string[];
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  phone: string;
  email: string;
  website?: string | null;
  description?: string | null;
  yearsInBusiness?: number | null;
  licensed?: boolean;
  licenseNumber?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceDescription?: string | null;
  paymentOptions?: string[];
  capacity?: number | null;
  availableSpots?: number | null;
  availableForFamilies: boolean;
  availableForOrganizations: boolean;
  claimed?: boolean;
  verificationStatus?: string | null;
  verified?: boolean;
}

interface ProviderProfileViewProps {
  profile: ProviderProfile;
  onEdit: () => void;
}

export default function ProviderProfileView({ profile, onEdit }: ProviderProfileViewProps) {
  const formatCareType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatProviderType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatPaymentOption = (option: string) => {
    return option
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatPrice = () => {
    if (profile.priceMin && profile.priceMax) {
      return `$${profile.priceMin.toLocaleString()} - $${profile.priceMax.toLocaleString()}/month`;
    }
    if (profile.priceMin) {
      return `From $${profile.priceMin.toLocaleString()}/month`;
    }
    if (profile.priceMax) {
      return `Up to $${profile.priceMax.toLocaleString()}/month`;
    }
    return null;
  };

  const isFacilityType = () => {
    return ['ASSISTED_LIVING', 'INDEPENDENT_LIVING', 'MEMORY_CARE', 'NURSING_HOME', 'REHABILITATION'].includes(profile.providerType);
  };

  const calculateCompletion = () => {
    let completed = 0;
    const total = 10;

    // Required fields (5)
    if (profile.providerType) completed++;
    if (profile.name) completed++;
    if (profile.careTypesOffered && profile.careTypesOffered.length > 0) completed++;
    if (profile.city && profile.state) completed++;
    if (profile.phone && profile.email) completed++;

    // Optional but valuable fields (5)
    if (profile.description) completed++;
    if (profile.priceMin || profile.priceMax) completed++;
    if (profile.yearsInBusiness) completed++;
    if (profile.licensed && profile.licenseNumber) completed++;
    if (profile.website) completed++;

    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();
  const priceDisplay = formatPrice();
  const isPending = profile.verificationStatus === 'pending' || (profile.claimed && !profile.verified);
  const isVerified = profile.verificationStatus === 'verified' || profile.verified === true;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Pending Verification Banner */}
      {isPending && (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 text-lg mb-1.5">
                Profile Pending Verification
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed mb-3">
                Your claim is currently under admin review. Our team typically reviews claims within 24 hours. You&apos;ll receive an email when your profile is approved and you can begin editing.
              </p>
              <p className="text-xs text-blue-700 font-medium">
                Full edit access will be granted after verification is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Profile</h1>
          <p className="text-gray-600">This is how families see your profile</p>
        </div>
        {isVerified ? (
          <button
            onClick={onEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-300 text-gray-500 font-semibold px-6 py-3 rounded-lg cursor-not-allowed"
            title="Profile editing requires verification"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Completion Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">
              Profile Strength: {completion}%
            </h2>
            <p className="text-sm text-indigo-800">
              {completion < 50 && 'Complete your profile to get more inquiries'}
              {completion >= 50 && completion < 80 && 'Good progress! Add more details to stand out'}
              {completion >= 80 && 'Excellent! Your profile is comprehensive'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">{completion}%</div>
          </div>
        </div>
        <div className="w-full bg-indigo-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              completion < 50 ? 'bg-orange-500' :
              completion < 80 ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-6">
        {/* Business Name & Type */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
          <p className="text-lg text-indigo-600 font-medium">{formatProviderType(profile.providerType)}</p>
        </div>

        {/* Care Types Offered */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Services Offered
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.careTypesOffered.map((type) => (
              <span
                key={type}
                className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
              >
                {formatCareType(type)}
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Location
          </h3>
          <div className="text-lg text-gray-900">
            {profile.address && <p className="mb-1">{profile.address}</p>}
            <p>
              {profile.city}, {profile.state}
              {profile.zipCode && ` ${profile.zipCode}`}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Contact Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{profile.email}</span>
            </div>
            {profile.website && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                  {profile.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              About Us
            </h3>
            <p className="text-gray-700 leading-relaxed">{profile.description}</p>
          </div>
        )}

        {/* Pricing */}
        {priceDisplay && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Pricing
            </h3>
            <p className="text-xl font-semibold text-gray-900 mb-2">{priceDisplay}</p>
            {profile.priceDescription && (
              <p className="text-sm text-gray-600">{profile.priceDescription}</p>
            )}
          </div>
        )}

        {/* Payment Options */}
        {profile.paymentOptions && profile.paymentOptions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Payment Options Accepted
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.paymentOptions.map((option) => (
                <span
                  key={option}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                >
                  {formatPaymentOption(option)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Facility Info */}
        {isFacilityType() && (profile.capacity || profile.availableSpots) && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Availability
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {profile.capacity && (
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-semibold text-gray-900">{profile.capacity}</p>
                </div>
              )}
              {profile.availableSpots !== null && profile.availableSpots !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Available Spots</p>
                  <p className="text-2xl font-semibold text-green-600">{profile.availableSpots}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience & Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.yearsInBusiness && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Years in Business
              </h3>
              <p className="text-2xl font-semibold text-gray-900">{profile.yearsInBusiness}</p>
            </div>
          )}
          {profile.licensed && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Licensed Provider
              </h3>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-gray-900 font-medium">Licensed</span>
              </div>
              {profile.licenseNumber && (
                <p className="text-sm text-gray-600 mt-1">License #{profile.licenseNumber}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibility Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {profile.availableForFamilies ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-gray-700">
              {profile.availableForFamilies ? 'Visible to families' : 'Hidden from families'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {profile.availableForOrganizations ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-gray-700">
              {profile.availableForOrganizations ? 'Visible to organizations' : 'Hidden from organizations'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
