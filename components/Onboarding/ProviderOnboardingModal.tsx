'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingModal from './OnboardingModal';

interface ProviderOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToFamily?: () => void;
  initialData?: {
    providerType?: string;
    name?: string;
    careTypesOffered?: string[];
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
  };
}

const PROVIDER_TYPES = [
  { value: 'HOME_CARE', label: 'Home Care' },
  { value: 'HOME_HEALTH', label: 'Home Health' },
  { value: 'ASSISTED_LIVING', label: 'Assisted Living' },
  { value: 'INDEPENDENT_LIVING', label: 'Independent Living' },
  { value: 'MEMORY_CARE', label: 'Memory Care' },
  { value: 'NURSING_HOME', label: 'Nursing Home' },
  { value: 'HOSPICE', label: 'Hospice' },
  { value: 'REHABILITATION', label: 'Rehabilitation' },
  { value: 'INDEPENDENT_CAREGIVER', label: 'Independent Caregiver' },
];

const CARE_TYPES = [
  { value: 'COMPANION_CARE', label: 'Companion Care' },
  { value: 'PERSONAL_CARE', label: 'Personal Care' },
  { value: 'SKILLED_NURSING', label: 'Skilled Nursing' },
  { value: 'MEMORY_CARE', label: 'Memory Care' },
  { value: 'HOSPICE_CARE', label: 'Hospice Care' },
  { value: 'RESPITE_CARE', label: 'Respite Care' },
  { value: 'LIVE_IN_CARE', label: 'Live-in Care' },
];

export default function ProviderOnboardingModal({
  isOpen,
  onClose,
  onSwitchToFamily,
  initialData,
}: ProviderOnboardingModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form state
  const [providerType, setProviderType] = useState(initialData?.providerType || '');
  const [name, setName] = useState(initialData?.name || '');
  const [careTypesOffered, setCareTypesOffered] = useState<string[]>(initialData?.careTypesOffered || []);
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');

  // Auto-save draft
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timer);
  }, [providerType, name, careTypesOffered, city, state, phone, email, isOpen]);

  const saveDraft = async () => {
    try {
      await fetch('/api/providers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerType,
          name,
          careTypesOffered,
          city,
          state,
          phone,
          email,
          availableForFamilies: true,
          availableForOrganizations: false,
        }),
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

    // Update user mode to family
    try {
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'FAMILY' }),
      });
    } catch (error) {
      console.error('Error updating mode:', error);
    }

    // Trigger the switch callback
    if (onSwitchToFamily) {
      onSwitchToFamily();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await saveDraft();
      onClose();
      router.push('/provider/dashboard');
      router.refresh(); // Force refresh to update completion status
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    let completed = 0;
    if (providerType) completed++;
    if (name) completed++;
    if (careTypesOffered.length > 0) completed++;
    if (city && state) completed++;
    if (phone && email) completed++;
    return Math.round((completed / 5) * 100);
  };

  const isComplete = Boolean(
    providerType &&
    name &&
    careTypesOffered.length > 0 &&
    city &&
    state &&
    phone &&
    email
  );

  return (
    <OnboardingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Up Your Provider Profile"
      subtitle="Connect with families looking for care"
      progress={calculateProgress()}
      onSaveAndExit={handleSaveAndExit}
    >
      <div className="space-y-8 pb-24">
        {/* Provider Type */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              What type of care provider are you? *
            </h3>
          </div>
          <select
            value={providerType}
            onChange={(e) => setProviderType(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
          >
            <option value="">Select provider type</option>
            {PROVIDER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Business Name */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              What&apos;s your business name? *
            </h3>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            placeholder="Enter your business name"
          />
        </div>

        {/* Care Types Offered */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              What types of care do you offer? *
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
                  careTypesOffered.includes(type.value)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={careTypesOffered.includes(type.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCareTypesOffered([...careTypesOffered, type.value]);
                    } else {
                      setCareTypesOffered(careTypesOffered.filter(t => t !== type.value));
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
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Where do you provide care? *
            </h3>
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

        {/* Contact Information */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              How can families reach you? *
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                placeholder="contact@example.com"
              />
            </div>
          </div>
        </div>

        {/* Mode Switch Link */}
        {onSwitchToFamily && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Looking for care instead?{' '}
              <button
                onClick={handleSwitchMode}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Switch to family onboarding →
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
