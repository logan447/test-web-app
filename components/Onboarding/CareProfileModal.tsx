'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingModal from './OnboardingModal';

interface CareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const CARE_TYPES = [
  { value: 'MEMORY_CARE', label: 'Memory Care' },
  { value: 'PERSONAL_CARE', label: 'Personal Care' },
  { value: 'SKILLED_NURSING', label: 'Skilled Nursing' },
  { value: 'COMPANION_CARE', label: 'Companion Care' },
  { value: 'RESPITE_CARE', label: 'Respite Care' },
  { value: 'HOSPICE_CARE', label: 'Hospice Care' },
];

const CARE_NEEDS = [
  'Alzheimer\'s/Dementia',
  'Mobility assistance',
  'Medication management',
  'Bathing/dressing',
  'Meal preparation',
  'Companionship',
];

export default function CareProfileModal({
  isOpen,
  onClose,
  onComplete,
}: CareProfileModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state - Required fields
  const [careType, setCareType] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [careNeeds, setCareNeeds] = useState<string[]>([]);

  // Optional fields
  const [whoNeedsCare, setWhoNeedsCare] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [timeline, setTimeline] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Load existing profile data
  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/care-profiles');
      if (response.ok) {
        const data = await response.json();
        const profile = data.profiles?.[0] || data.profile;

        if (profile) {
          setCareType(profile.careType || []);
          setCity(profile.city || '');
          setState(profile.state || '');
          setCareNeeds(profile.careNeeds || []);
          setWhoNeedsCare(profile.whoNeedsCare || '');
          setBudgetMin(profile.budgetMin?.toString() || '');
          setBudgetMax(profile.budgetMax?.toString() || '');
          setTimeline(profile.timeline || '');
          setAdditionalInfo(profile.additionalInfo || '');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const response = await fetch('/api/care-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careType,
          city,
          state,
          careNeeds,
          whoNeedsCare,
          budgetMin: budgetMin ? parseInt(budgetMin) : null,
          budgetMax: budgetMax ? parseInt(budgetMax) : null,
          timeline,
          additionalInfo,
          isPublic: true,
          visibleToProviders: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await saveProfile();
    setSaving(false);

    if (success) {
      if (onComplete) {
        onComplete();
      }
      onClose();
      router.refresh(); // Refresh to update completion status
    }
  };

  const handleSaveAndExit = async () => {
    await saveProfile();
  };

  const calculateProgress = () => {
    let completed = 0;
    const total = 7; // Required + optional fields

    if (careType.length > 0) completed++;
    if (city && state) completed++;
    if (careNeeds.length > 0) completed++;
    if (whoNeedsCare) completed++;
    if (budgetMin || budgetMax) completed++;
    if (timeline) completed++;
    if (additionalInfo) completed++;

    return Math.round((completed / total) * 100);
  };

  const isRequiredComplete = careType.length > 0 && city && state && careNeeds.length > 0;

  if (loading) {
    return (
      <OnboardingModal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading..."
        progress={0}
        onSaveAndExit={handleSaveAndExit}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </OnboardingModal>
    );
  }

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Your Care Profile"
      subtitle="Help providers understand your needs"
      progress={calculateProgress()}
      onSaveAndExit={handleSaveAndExit}
    >
      <div className="space-y-8 pb-24">
        {/* Required Fields Section */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Required Information</h2>

          {/* Care Type */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              What type of care do you need? *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CARE_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    careType.includes(type.value)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={careType.includes(type.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCareType([...careType, type.value]);
                      } else {
                        setCareType(careType.filter(t => t !== type.value));
                      }
                    }}
                    className="mr-3 w-5 h-5 text-indigo-600"
                  />
                  <span className="font-medium text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Where do you need care? *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                >
                  <option value="">Select state</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="AZ">Arizona</option>
                  <option value="WA">Washington</option>
                  <option value="OR">Oregon</option>
                  <option value="NV">Nevada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Care Needs */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              What specific care needs do you have? *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CARE_NEEDS.map((need) => (
                <label
                  key={need}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    careNeeds.includes(need)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
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
                    className="mr-3 w-5 h-5 text-indigo-600"
                  />
                  <span className="font-medium text-gray-900">{need}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Fields Section */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Optional Information</h2>
          <p className="text-sm text-gray-600 mb-6">
            Adding more details helps providers better understand your needs
          </p>

          {/* Who Needs Care */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who needs care?
            </label>
            <input
              type="text"
              value={whoNeedsCare}
              onChange={(e) => setWhoNeedsCare(e.target.value)}
              placeholder="e.g., My mother, My father, Myself"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Budget */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Budget Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Min ($)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max ($)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When do you need care?
            </label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            >
              <option value="">Select timeline</option>
              <option value="ASAP">As soon as possible</option>
              <option value="1_2_WEEKS">Within 1-2 weeks</option>
              <option value="1_MONTH">Within 1 month</option>
              <option value="1_3_MONTHS">Within 1-3 months</option>
              <option value="3_6_MONTHS">Within 3-6 months</option>
              <option value="EXPLORING">Just exploring options</option>
            </select>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional information
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              placeholder="Any other details that would help providers understand your needs..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!isRequiredComplete || saving}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              isRequiredComplete && !saving
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {!isRequiredComplete && (
          <p className="text-sm text-gray-600 text-center">
            Complete all required fields (*) to save your profile
          </p>
        )}
      </div>
    </OnboardingModal>
  );
}
