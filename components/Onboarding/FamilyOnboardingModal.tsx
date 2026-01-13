'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingModal from './OnboardingModal';

interface FamilyOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToProvider?: () => void;
  initialData?: {
    careType?: string[];
    city?: string;
    state?: string;
    careNeeds?: string[];
  };
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

export default function FamilyOnboardingModal({
  isOpen,
  onClose,
  onSwitchToProvider,
  initialData,
}: FamilyOnboardingModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [careType, setCareType] = useState<string[]>(initialData?.careType || []);
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [careNeeds, setCareNeeds] = useState<string[]>(initialData?.careNeeds || []);

  // Auto-save draft
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timer);
  }, [careType, city, state, careNeeds, isOpen]);

  const saveDraft = async () => {
    try {
      // Check if profile exists first
      const checkResponse = await fetch('/api/care-profiles');
      const existingProfile = checkResponse.ok ? await checkResponse.json() : null;

      // Use correct field names for API
      const profileData = {
        careTypes: careType, // API expects 'careTypes' not 'careType'
        city,
        state,
        careNeeds,
        isPublic: true,
        visibleToProviders: true,
        location: `${city}, ${state}`,
        zipCode: '', // Required by schema
      };

      // Use PATCH for updates, POST for new
      const method = existingProfile && existingProfile.id ? 'PATCH' : 'POST';

      await fetch('/api/care-profiles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSaveAndExit = async () => {
    await saveDraft();
  };

  const handleSwitchMode = async () => {
    // Save current draft before switching modes
    await saveDraft();

    // Update user mode to provider
    try {
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PROVIDER' }),
      });
    } catch (error) {
      console.error('Error updating mode:', error);
    }

    // Trigger the switch callback
    if (onSwitchToProvider) {
      onSwitchToProvider();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await saveDraft();
      onClose();
      router.push('/dashboard');
      router.refresh(); // Force refresh to update completion status
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    let completed = 0;
    if (careType.length > 0) completed++;
    if (city && state) completed++;
    if (careNeeds.length > 0) completed++;
    return Math.round((completed / 3) * 100);
  };

  const isComplete = careType.length > 0 && city && state && careNeeds.length > 0;

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Find the Right Care"
      subtitle="Tell us about your care needs"
      progress={calculateProgress()}
      onSaveAndExit={handleSaveAndExit}
    >
      <div className="space-y-8 pb-24">
        {/* Step 1: Care Type */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              What type of care do you need? *
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select all that apply
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CARE_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  careType.includes(type.value)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
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

        {/* Step 2: Location */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Where do you need care? *
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              We&apos;ll match you with providers in your area
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
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

        {/* Step 3: Specific Care Needs */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              What specific care needs do you have? *
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select all that apply
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CARE_NEEDS.map((need) => (
              <label
                key={need}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                  className="mr-3 w-5 h-5 text-indigo-600"
                />
                <span className="font-medium text-gray-900">{need}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mode Switch Link */}
        {onSwitchToProvider && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Are you a care provider?{' '}
              <button
                onClick={handleSwitchMode}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Switch to provider onboarding →
              </button>
            </p>
          </div>
        )}

        {/* Complete Button */}
        <div className="flex justify-end">
          <button
            onClick={handleComplete}
            disabled={!isComplete || saving}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              isComplete && !saving
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>

        {!isComplete && (
          <p className="text-sm text-gray-600 text-center">
            Complete all required fields (*) to finish setup
          </p>
        )}
      </div>
    </OnboardingModal>
  );
}
