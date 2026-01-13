'use client';

interface CareProfile {
  id: string;
  careType: string[];
  city: string;
  state: string;
  zipCode?: string;
  careNeeds: string[];
  whoNeedsCare?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline?: string | null;
  description?: string | null;
  isPublic: boolean;
  visibleToProviders: boolean;
}

interface CareProfileViewProps {
  profile: CareProfile;
  onEdit: () => void;
}

export default function CareProfileView({ profile, onEdit }: CareProfileViewProps) {
  const formatCareType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatBudget = () => {
    if (profile.budgetMin && profile.budgetMax) {
      return `$${profile.budgetMin.toLocaleString()} - $${profile.budgetMax.toLocaleString()}/month`;
    }
    if (profile.budgetMin) {
      return `From $${profile.budgetMin.toLocaleString()}/month`;
    }
    if (profile.budgetMax) {
      return `Up to $${profile.budgetMax.toLocaleString()}/month`;
    }
    return 'Not specified';
  };

  const calculateCompletion = () => {
    let completed = 0;
    const total = 10;

    // Required fields (3)
    if (profile.careType && profile.careType.length > 0) completed++;
    if (profile.city && profile.state) completed++;
    if (profile.careNeeds && profile.careNeeds.length > 0) completed++;

    // Optional but valuable fields (7)
    if (profile.whoNeedsCare) completed++;
    if (profile.budgetMin || profile.budgetMax) completed++;
    if (profile.timeline) completed++;
    if (profile.description) completed++;
    if (profile.zipCode) completed++;

    // Privacy settings count as complete if set
    completed += 2;

    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Care Profile</h1>
          <p className="text-gray-600">This is how providers see your profile</p>
        </div>
        <button
          onClick={onEdit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile Completion Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">
              Profile Strength: {completion}%
            </h2>
            <p className="text-sm text-indigo-800">
              {completion < 50 && 'Complete your profile to get better matches'}
              {completion >= 50 && completion < 80 && 'Good! Add more details to stand out'}
              {completion >= 80 && 'Excellent! Your profile is well-detailed'}
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
        {/* Care Type */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Care Type Needed
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.careType.map((type) => (
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
          <p className="text-lg text-gray-900">
            {profile.city}, {profile.state}
            {profile.zipCode && ` ${profile.zipCode}`}
          </p>
        </div>

        {/* Care Needs */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Specific Care Needs
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.careNeeds.map((need, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
              >
                {need}
              </span>
            ))}
          </div>
        </div>

        {/* Optional Fields */}
        {profile.whoNeedsCare && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Who Needs Care
            </h3>
            <p className="text-lg text-gray-900">{profile.whoNeedsCare}</p>
          </div>
        )}

        {(profile.budgetMin || profile.budgetMax) && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Budget
            </h3>
            <p className="text-lg text-gray-900">{formatBudget()}</p>
          </div>
        )}

        {profile.timeline && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Timeline
            </h3>
            <p className="text-lg text-gray-900">{profile.timeline}</p>
          </div>
        )}

        {profile.description && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Additional Information
            </h3>
            <p className="text-gray-700 leading-relaxed">{profile.description}</p>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Visibility</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {profile.isPublic ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-gray-700">Profile is {profile.isPublic ? 'public' : 'private'}</span>
          </div>
          <div className="flex items-center gap-3">
            {profile.visibleToProviders ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-gray-700">
              {profile.visibleToProviders ? 'Visible to providers' : 'Hidden from providers'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
