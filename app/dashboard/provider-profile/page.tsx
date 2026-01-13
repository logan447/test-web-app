'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainNav from '@/components/Navigation/MainNav';

interface ProviderProfile {
  id: string;
  // Required fields (from onboarding)
  providerType: string;
  name: string;
  careTypesOffered: string[];
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  // Optional fields
  website?: string | null;
  description?: string | null;
  yearsInBusiness?: number | null;
  licensed?: boolean;
  licenseNumber?: string | null;
  // Pricing (optional)
  priceMin?: number | null;
  priceMax?: number | null;
  priceDescription?: string | null;
  paymentOptions?: string[];
  // Facility-specific (conditional)
  capacity?: number | null;
  availableSpots?: number | null;
  // Privacy
  availableForFamilies: boolean;
  availableForOrganizations: boolean;
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

      {isExpanded && (
        <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

const PROVIDER_TYPES = [
  { value: 'HOME_CARE', label: 'Home Care', isFacility: false },
  { value: 'HOME_HEALTH', label: 'Home Health', isFacility: false },
  { value: 'ASSISTED_LIVING', label: 'Assisted Living', isFacility: true },
  { value: 'INDEPENDENT_LIVING', label: 'Independent Living', isFacility: true },
  { value: 'MEMORY_CARE', label: 'Memory Care', isFacility: true },
  { value: 'NURSING_HOME', label: 'Nursing Home', isFacility: true },
  { value: 'HOSPICE', label: 'Hospice', isFacility: false },
  { value: 'REHABILITATION', label: 'Rehabilitation', isFacility: true },
  { value: 'INDEPENDENT_CAREGIVER', label: 'Independent Caregiver', isFacility: false },
];

const CARE_TYPES = [
  'COMPANION_CARE',
  'PERSONAL_CARE',
  'SKILLED_NURSING',
  'MEMORY_CARE',
  'HOSPICE_CARE',
  'RESPITE_CARE',
  'LIVE_IN_CARE',
];

const PAYMENT_OPTIONS = [
  'PRIVATE_PAY',
  'LONG_TERM_CARE_INSURANCE',
  'VETERANS_BENEFITS',
  'MEDICAID',
  'MEDICARE',
  'WORKERS_COMP',
  'PAYMENT_PLANS',
];

export default function ProviderProfileNew() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state - Required
  const [providerType, setProviderType] = useState('');
  const [name, setName] = useState('');
  const [careTypesOffered, setCareTypesOffered] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Form state - Optional
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState<number | undefined>(undefined);
  const [licensed, setLicensed] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');

  // Form state - Pricing
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [priceDescription, setPriceDescription] = useState('');
  const [paymentOptions, setPaymentOptions] = useState<string[]>([]);

  // Form state - Facility-specific
  const [capacity, setCapacity] = useState<number | undefined>(undefined);
  const [availableSpots, setAvailableSpots] = useState<number | undefined>(undefined);

  // Form state - Privacy
  const [availableForFamilies, setAvailableForFamilies] = useState(true);
  const [availableForOrganizations, setAvailableForOrganizations] = useState(false);

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    essential: true,
    services: false,
    facility: false,
    additional: false,
    privacy: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/providers/me');
      if (response.ok) {
        const data = await response.json();
        if (data.provider) {
          setProfile(data.provider);
          // Populate form fields
          setProviderType(data.provider.providerType || '');
          setName(data.provider.name || '');
          setCareTypesOffered(data.provider.careTypesOffered || []);
          setAddress(data.provider.address || '');
          setCity(data.provider.city || '');
          setState(data.provider.state || '');
          setZipCode(data.provider.zipCode || '');
          setPhone(data.provider.phone || '');
          setEmail(data.provider.email || '');
          setWebsite(data.provider.website || '');
          setDescription(data.provider.description || '');
          setYearsInBusiness(data.provider.yearsInBusiness || undefined);
          setLicensed(data.provider.licensed || false);
          setLicenseNumber(data.provider.licenseNumber || '');
          setPriceMin(data.provider.priceMin || undefined);
          setPriceMax(data.provider.priceMax || undefined);
          setPriceDescription(data.provider.priceDescription || '');
          setPaymentOptions(data.provider.paymentOptions || []);
          setCapacity(data.provider.capacity || undefined);
          setAvailableSpots(data.provider.availableSpots || undefined);
          setAvailableForFamilies(data.provider.availableForFamilies !== undefined ? data.provider.availableForFamilies : true);
          setAvailableForOrganizations(data.provider.availableForOrganizations || false);
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

    // Validation
    if (!providerType || !name || !city || !state || !phone || !email || careTypesOffered.length === 0) {
      setError('Please fill in all required fields');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/providers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerType,
          name,
          careTypesOffered,
          address,
          city,
          state,
          zipCode,
          phone,
          email,
          website,
          description,
          yearsInBusiness,
          licensed,
          licenseNumber: licensed ? licenseNumber : null,
          priceMin,
          priceMax,
          priceDescription,
          paymentOptions,
          capacity: isFacilityType() ? capacity : null,
          availableSpots: isFacilityType() ? availableSpots : null,
          availableForFamilies,
          availableForOrganizations,
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

  const isFacilityType = () => {
    const providerTypeObj = PROVIDER_TYPES.find(pt => pt.value === providerType);
    return providerTypeObj?.isFacility || false;
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 10;

    // Required fields (5)
    if (providerType) completed++;
    if (name) completed++;
    if (careTypesOffered.length > 0) completed++;
    if (city && state) completed++;
    if (phone && email) completed++;

    // Optional but valuable fields (5)
    if (description) completed++;
    if (priceMin || priceMax) completed++;
    if (yearsInBusiness) completed++;
    if (licensed && licenseNumber) completed++;
    if (website) completed++;

    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();
  const isEssentialComplete = Boolean(providerType && name && careTypesOffered.length > 0 && city && state && phone && email);
  const isServicesComplete = Boolean((priceMin || priceMax) && paymentOptions.length > 0);
  const isFacilityComplete = isFacilityType() ? Boolean(capacity || description) : true;
  const isAdditionalComplete = Boolean(website || description || yearsInBusiness);

  const formatCareType = (type: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Profile</h1>
          <p className="text-gray-600">
            Complete your profile to help families find you and understand your services.
          </p>
        </div>

        {/* Profile Completion Meter */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Strength</h2>
              <p className="text-sm text-gray-600">
                {completion < 50 && 'Complete your profile to get more family inquiries'}
                {completion >= 50 && completion < 80 && 'Good progress! Add more details to stand out'}
                {completion >= 80 && 'Excellent! Your profile is comprehensive'}
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
            subtitle="Required details about your business and services"
            badge={isEssentialComplete ? "Complete" : "Required"}
            badgeColor={isEssentialComplete ? "green" : "blue"}
            isExpanded={expandedSections.essential}
            onToggle={() => toggleSection('essential')}
            isComplete={isEssentialComplete}
          >
            <div className="space-y-6">
              {/* Provider Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type *
                </label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                >
                  <option value="">Select provider type</option>
                  {PROVIDER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                  placeholder="Enter your business name"
                />
              </div>

              {/* Care Types Offered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Care Types You Offer *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CARE_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        careTypesOffered.includes(type)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={careTypesOffered.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCareTypesOffered([...careTypesOffered, type]);
                          } else {
                            setCareTypesOffered(careTypesOffered.filter(t => t !== type));
                          }
                        }}
                        className="mr-3 w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm">{formatCareType(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                    placeholder="San Diego"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                    placeholder="92101"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
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
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Services & Pricing */}
          <CollapsibleSection
            title="Services & Pricing"
            subtitle="Help families understand your costs and payment options"
            badge={isServicesComplete ? "Complete" : "Optional"}
            badgeColor={isServicesComplete ? "green" : "gray"}
            isExpanded={expandedSections.services}
            onToggle={() => toggleSection('services')}
            isComplete={isServicesComplete}
          >
            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (per month)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={priceMin || ''}
                      onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                      placeholder="Min price"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={priceMax || ''}
                      onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                      placeholder="Max price"
                    />
                  </div>
                </div>
              </div>

              {/* Price Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Details
                </label>
                <textarea
                  value={priceDescription}
                  onChange={(e) => setPriceDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                  placeholder="Describe what's included in your pricing..."
                />
              </div>

              {/* Payment Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Options Accepted
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentOptions.includes(option)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={paymentOptions.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPaymentOptions([...paymentOptions, option]);
                          } else {
                            setPaymentOptions(paymentOptions.filter(o => o !== option));
                          }
                        }}
                        className="mr-3 w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm">{formatPaymentOption(option)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 3: Facility Details (conditional) */}
          {isFacilityType() && (
            <CollapsibleSection
              title="Facility Details"
              subtitle="Capacity and facility-specific information"
              badge={isFacilityComplete ? "Complete" : "Optional"}
              badgeColor={isFacilityComplete ? "green" : "gray"}
              isExpanded={expandedSections.facility}
              onToggle={() => toggleSection('facility')}
              isComplete={isFacilityComplete}
            >
              <div className="space-y-6">
                {/* Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Capacity
                    </label>
                    <input
                      type="number"
                      value={capacity || ''}
                      onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Spots
                    </label>
                    <input
                      type="number"
                      value={availableSpots || ''}
                      onChange={(e) => setAvailableSpots(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Section 4: Additional Information */}
          <CollapsibleSection
            title="Additional Information"
            subtitle="Help families learn more about your business"
            badge={isAdditionalComplete ? "Complete" : "Optional"}
            badgeColor={isAdditionalComplete ? "green" : "gray"}
            isExpanded={expandedSections.additional}
            onToggle={() => toggleSection('additional')}
            isComplete={isAdditionalComplete}
          >
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Your Business
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                  placeholder="Tell families about your services, experience, and what makes you unique..."
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                  placeholder="https://example.com"
                />
              </div>

              {/* Years in Business */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business
                </label>
                <input
                  type="number"
                  value={yearsInBusiness || ''}
                  onChange={(e) => setYearsInBusiness(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                  placeholder="e.g., 10"
                />
              </div>

              {/* Licensing */}
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={licensed}
                    onChange={(e) => setLicensed(e.target.checked)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Licensed Provider
                  </span>
                </label>

                {licensed && (
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-0"
                    placeholder="Enter license number"
                  />
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 5: Privacy Settings */}
          <CollapsibleSection
            title="Privacy & Visibility"
            subtitle="Control who can see your profile"
            badge="Important"
            badgeColor="blue"
            isExpanded={expandedSections.privacy}
            onToggle={() => toggleSection('privacy')}
            isComplete={true}
          >
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Control who can find and contact you through Olera. You can change these settings anytime.
                </p>
              </div>

              {/* Visibility Toggles */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={availableForFamilies}
                    onChange={(e) => setAvailableForFamilies(e.target.checked)}
                    className="mt-1 w-5 h-5 text-indigo-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      Visible to Families
                    </div>
                    <div className="text-sm text-gray-600">
                      Allow families to find you in search results and send consultation requests
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={availableForOrganizations}
                    onChange={(e) => setAvailableForOrganizations(e.target.checked)}
                    className="mt-1 w-5 h-5 text-indigo-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      Visible to Organizations
                    </div>
                    <div className="text-sm text-gray-600">
                      Allow organizations to find you for staffing and partnership opportunities
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

          <button
            onClick={() => router.push('/provider/dashboard')}
            className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium border-2 border-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
