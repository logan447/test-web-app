'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainNav from '@/components/Navigation/MainNav';
import CareProfileView from '@/components/Profile/CareProfileView';

interface CareProfile {
  id: string;
  // Required fields (from onboarding)
  careType: string[];
  city: string;
  state: string;
  zipCode: string;
  careNeeds: string[];
  // Optional fields
  whoNeedsCare?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline?: string | null;
  description?: string | null;
  // Privacy
  isPublic: boolean;
  visibleToProviders: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  isExpanded: boolean;
  onToggle: () => void;
  isComplete: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  isExpanded,
  onToggle,
  isComplete,
  children,
}: CollapsibleSectionProps) {
  const badgeColors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          {/* Status icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isComplete ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {isComplete ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>

          {/* Title and subtitle */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {badge && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${badgeColors[badgeColor as keyof typeof badgeColors]}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>

        {/* Expand/collapse icon */}
        <div className="flex-shrink-0 ml-4">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function CareProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CareProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Section expansion states
  const [expandedSections, setExpandedSections] = useState({
    essential: true,
    budget: false,
    details: false,
    privacy: false,
  });

  // Form states
  const [careType, setCareType] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [careNeeds, setCareNeeds] = useState<string[]>([]);
  const [whoNeedsCare, setWhoNeedsCare] = useState('');
  const [budgetMin, setBudgetMin] = useState<number | undefined>();
  const [budgetMax, setBudgetMax] = useState<number | undefined>();
  const [timeline, setTimeline] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [visibleToProviders, setVisibleToProviders] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/care-profiles');
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
          // Populate form fields
          setCareType(data.profile.careType || []);
          setCity(data.profile.city || '');
          setState(data.profile.state || '');
          setZipCode(data.profile.zipCode || '');
          setCareNeeds(data.profile.careNeeds || []);
          setWhoNeedsCare(data.profile.whoNeedsCare || '');
          setBudgetMin(data.profile.budgetMin || undefined);
          setBudgetMax(data.profile.budgetMax || undefined);
          setTimeline(data.profile.timeline || '');
          setDescription(data.profile.description || '');
          setIsPublic(data.profile.isPublic !== undefined ? data.profile.isPublic : true);
          setVisibleToProviders(data.profile.visibleToProviders !== undefined ? data.profile.visibleToProviders : true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/care-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careType,
          city,
          state,
          zipCode,
          careNeeds,
          whoNeedsCare,
          budgetMin,
          budgetMax,
          timeline,
          description,
          isPublic,
          visibleToProviders,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Profile updated successfully!');
        fetchProfile();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 10;

    // Required fields (3)
    if (careType.length > 0) completed++;
    if (city && state) completed++;
    if (careNeeds.length > 0) completed++;

    // Optional but valuable fields (7)
    if (whoNeedsCare) completed++;
    if (budgetMin || budgetMax) completed++;
    if (timeline) completed++;
    if (description) completed++;
    if (zipCode) completed++;

    // Privacy settings count as complete if set
    completed += 2;

    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();
  const isEssentialComplete = Boolean(careType.length > 0 && city && state && careNeeds.length > 0);
  const isBudgetComplete = Boolean(budgetMin || budgetMax || timeline);
  const isDetailsComplete = Boolean(whoNeedsCare || description);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  // Show view mode if not editing and profile exists
  if (!isEditMode && profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <CareProfileView
          profile={profile}
          onEdit={() => setIsEditMode(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Care Profile</h1>
          <p className="text-gray-600">
            Complete your profile to help providers understand your needs and match you with the right care options.
          </p>
        </div>

        {/* Profile Completion Meter */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Strength</h2>
              <p className="text-sm text-gray-600">
                {completion < 50 && 'Complete your profile to get better matches'}
                {completion >= 50 && completion < 80 && 'Good start! Add more details to stand out'}
                {completion >= 80 && 'Excellent! Your profile is well-detailed'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">{completion}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
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

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {/* Section 1: Essential Information */}
          <CollapsibleSection
            title="Essential Information"
            subtitle="Required details about your care needs and location"
            badge={isEssentialComplete ? "Complete" : "Required"}
            badgeColor={isEssentialComplete ? "green" : "blue"}
            isExpanded={expandedSections.essential}
            onToggle={() => toggleSection('essential')}
            isComplete={isEssentialComplete}
          >
            <div className="space-y-6">
              {/* Care Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of care do you need? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['MEMORY_CARE', 'PERSONAL_CARE', 'SKILLED_NURSING', 'COMPANION_CARE', 'RESPITE_CARE', 'HOSPICE_CARE'].map((type) => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        careType.includes(type)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={careType.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCareType([...careType, type]);
                          } else {
                            setCareType(careType.filter(t => t !== type));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                    placeholder="San Diego"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="">Select state</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    {/* Add more states */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                    placeholder="92101"
                  />
                </div>
              </div>

              {/* Care Needs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific care needs *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Alzheimer\'s/Dementia', 'Mobility assistance', 'Medication management', 'Bathing/dressing', 'Meal preparation', 'Companionship'].map((need) => (
                    <label
                      key={need}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        careNeeds.includes(need)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={careNeeds.includes(need)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCareNeeds([...careNeeds, need]);
                          } else {
                            setCareNeeds(careNeeds.filter(n => n !== need));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-900">{need}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Budget & Timeline */}
          <CollapsibleSection
            title="Budget & Timeline"
            subtitle="Help providers understand your budget and timing needs"
            badge="Optional"
            badgeColor="gray"
            isExpanded={expandedSections.budget}
            onToggle={() => toggleSection('budget')}
            isComplete={isBudgetComplete}
          >
            <div className="space-y-6">
              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly budget range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={budgetMin || ''}
                      onChange={(e) => setBudgetMin(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Min ($)"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={budgetMax || ''}
                      onChange={(e) => setBudgetMax(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Max ($)"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When do you need care?
                </label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                >
                  <option value="">Select timeline</option>
                  <option value="ASAP">ASAP (within 2 weeks)</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                  <option value="Just exploring">Just exploring options</option>
                </select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 3: Additional Details */}
          <CollapsibleSection
            title="Additional Details"
            subtitle="Optional information to help providers serve you better"
            badge="Optional"
            badgeColor="gray"
            isExpanded={expandedSections.details}
            onToggle={() => toggleSection('details')}
            isComplete={isDetailsComplete}
          >
            <div className="space-y-6">
              {/* Who Needs Care */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who needs care?
                </label>
                <select
                  value={whoNeedsCare}
                  onChange={(e) => setWhoNeedsCare(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="Myself">Myself</option>
                  <option value="My parent">My parent</option>
                  <option value="My spouse">My spouse</option>
                  <option value="Other family member">Other family member</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional information
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                  placeholder="Any additional details you'd like providers to know..."
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 4: Privacy Settings */}
          <CollapsibleSection
            title="Privacy Settings"
            subtitle="Control who can see your profile"
            badge="Important"
            badgeColor="blue"
            isExpanded={expandedSections.privacy}
            onToggle={() => toggleSection('privacy')}
            isComplete={true}
          >
            <div className="space-y-6">
              {/* Public/Private Toggle */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic && visibleToProviders}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setIsPublic(isChecked);
                      setVisibleToProviders(isChecked);
                    }}
                    className="mt-1 mr-3 w-5 h-5 text-indigo-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      Visible to providers
                    </div>
                    <p className="text-sm text-gray-600">
                      Allow providers in your area to see your profile and reach out with care options.
                      You can change this anytime.
                    </p>
                  </div>
                </label>
              </div>

              {/* Allow Messages Toggle */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleToProviders}
                    onChange={(e) => setVisibleToProviders(e.target.checked)}
                    className="mt-1 mr-3 w-5 h-5 text-indigo-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      Allow direct messages
                    </div>
                    <p className="text-sm text-gray-600">
                      Let providers contact you directly about their services and availability.
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Your privacy is important.</strong> We never share your contact information
                  without your permission. Providers can only message you through our platform.
                </p>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => setIsEditMode(false)}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await handleSave();
              if (!error) {
                setIsEditMode(false);
              }
            }}
            disabled={saving || !isEssentialComplete}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              saving || !isEssentialComplete
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
