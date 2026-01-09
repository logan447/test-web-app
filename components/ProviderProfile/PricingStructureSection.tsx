"use client";

import { useState } from "react";

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  frequency: "monthly" | "one-time" | "per-visit";
}

export interface PricingStructureData {
  // Base rates
  privateRoomMin: number | null;
  privateRoomMax: number | null;
  semiPrivateRoomMin: number | null;
  semiPrivateRoomMax: number | null;

  // What's included
  includedServices: string[];

  // Additional services
  additionalServices: AdditionalService[];

  // One-time fees
  communityFee: number | null;
  securityDeposit: number | null;
  applicationFee: number | null;

  // Payment & financial
  acceptsFinancialAssistance: boolean;
  financialAssistanceTypes: string[];
  offersPaymentPlans: boolean;
  paymentPlanDetails: string;
}

interface PricingStructureSectionProps {
  data: PricingStructureData;
  onChange: (data: PricingStructureData) => void;
}

const INCLUDED_SERVICES = [
  { id: "meals_3", label: "3 Meals Per Day", icon: "🍽️" },
  { id: "snacks", label: "Snacks & Beverages", icon: "☕" },
  { id: "housekeeping", label: "Housekeeping Services", icon: "🧹" },
  { id: "laundry", label: "Laundry Services", icon: "👔" },
  { id: "basic_activities", label: "Basic Activities & Programs", icon: "🎨" },
  { id: "staff_24_7", label: "24/7 Staff Availability", icon: "👥" },
  { id: "utilities", label: "Utilities (Water, Electric, Heat)", icon: "💡" },
  { id: "maintenance", label: "Building Maintenance", icon: "🔧" },
  { id: "cable_wifi", label: "Cable TV & WiFi", icon: "📺" },
  { id: "emergency_response", label: "Emergency Response System", icon: "🚨" },
];

const FINANCIAL_ASSISTANCE_TYPES = [
  { id: "ltc_insurance", label: "Long-Term Care Insurance", description: "We work with most LTC insurance providers" },
  { id: "medicare", label: "Medicare", description: "Accepted for qualifying services" },
  { id: "medicaid", label: "Medicaid", description: "We accept Medicaid waiver programs" },
  { id: "veterans", label: "Veterans Benefits", description: "Aid & Attendance, VA pensions" },
  { id: "life_insurance", label: "Life Insurance Benefits", description: "Accelerated death benefits" },
  { id: "reverse_mortgage", label: "Reverse Mortgage", description: "We can help arrange reverse mortgage funding" },
];

export default function PricingStructureSection({ data, onChange }: PricingStructureSectionProps) {
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceFrequency, setNewServiceFrequency] = useState<"monthly" | "one-time" | "per-visit">("monthly");

  const toggleIncludedService = (serviceId: string) => {
    const newServices = data.includedServices.includes(serviceId)
      ? data.includedServices.filter((s) => s !== serviceId)
      : [...data.includedServices, serviceId];
    onChange({ ...data, includedServices: newServices });
  };

  const toggleFinancialAssistance = (typeId: string) => {
    const newTypes = data.financialAssistanceTypes.includes(typeId)
      ? data.financialAssistanceTypes.filter((t) => t !== typeId)
      : [...data.financialAssistanceTypes, typeId];
    onChange({ ...data, financialAssistanceTypes: newTypes });
  };

  const addAdditionalService = () => {
    if (!newServiceName.trim() || !newServicePrice) return;

    const newService: AdditionalService = {
      id: Date.now().toString(),
      name: newServiceName.trim(),
      price: parseFloat(newServicePrice),
      frequency: newServiceFrequency,
    };

    onChange({
      ...data,
      additionalServices: [...data.additionalServices, newService],
    });

    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceFrequency("monthly");
  };

  const removeAdditionalService = (serviceId: string) => {
    onChange({
      ...data,
      additionalServices: data.additionalServices.filter((s) => s.id !== serviceId),
    });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "";
    return `$${value.toLocaleString()}`;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      monthly: "/month",
      "one-time": "(one-time)",
      "per-visit": "/visit",
    };
    return labels[frequency as keyof typeof labels] || "";
  };

  return (
    <div className="space-y-8">
      {/* Pricing Transparency Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Pricing Transparency Builds Trust</h4>
            <p className="text-sm text-blue-800">
              Clear pricing information helps families make informed decisions. Providers with transparent pricing receive 4x more inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Base Monthly Rates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Base Monthly Rates</h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide your pricing range for different room types. Families appreciate transparency about costs.
        </p>

        <div className="space-y-4">
          {/* Private Room */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span>🏠</span> Private Room
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price (per month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={data.privateRoomMin || ""}
                    onChange={(e) => onChange({ ...data, privateRoomMin: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="4500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price (per month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={data.privateRoomMax || ""}
                    onChange={(e) => onChange({ ...data, privateRoomMax: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="7000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Semi-Private Room */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <span>🛏️</span> Semi-Private/Shared Room
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price (per month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={data.semiPrivateRoomMin || ""}
                    onChange={(e) => onChange({ ...data, semiPrivateRoomMin: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="3500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price (per month)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={data.semiPrivateRoomMax || ""}
                    onChange={(e) => onChange({ ...data, semiPrivateRoomMax: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="5500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Included in Base Rate */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s Included in Base Rate</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all services included in your base monthly rate. This helps families understand the value.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INCLUDED_SERVICES.map((service) => (
            <label
              key={service.id}
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                data.includedServices.includes(service.id)
                  ? "border-primary-400 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={data.includedServices.includes(service.id)}
                onChange={() => toggleIncludedService(service.id)}
                className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <span>{service.icon}</span>
                  {service.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Services */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Additional Services (À La Carte)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Services available for an additional fee beyond the base rate
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdditionalServices(!showAdditionalServices)}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {showAdditionalServices ? "Hide" : "Add Services"}
          </button>
        </div>

        {showAdditionalServices && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g., Medication Management"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="250"
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={newServiceFrequency}
                  onChange={(e) => setNewServiceFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="monthly">Per Month</option>
                  <option value="one-time">One-Time</option>
                  <option value="per-visit">Per Visit</option>
                </select>
              </div>
              <div className="md:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={addAdditionalService}
                  className="w-full px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {data.additionalServices.length > 0 && (
          <div className="space-y-2">
            {data.additionalServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {formatCurrency(service.price)} {getFrequencyLabel(service.frequency)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAdditionalService(service.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* One-Time Fees */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">One-Time Fees</h3>
        <p className="text-sm text-gray-600 mb-4">
          Any one-time fees or deposits required (leave blank if not applicable)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Fee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={data.communityFee || ""}
                onChange={(e) => onChange({ ...data, communityFee: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                placeholder="2500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Security Deposit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={data.securityDeposit || ""}
                onChange={(e) => onChange({ ...data, securityDeposit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                placeholder="1000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Fee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={data.applicationFee || ""}
                onChange={(e) => onChange({ ...data, applicationFee: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                placeholder="100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Assistance & Payment Options */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Assistance & Payment Options</h3>
        <p className="text-sm text-gray-600 mb-4">
          Help families understand their payment options and financial assistance programs you accept
        </p>

        <div className="space-y-4">
          {/* Accepts Financial Assistance Toggle */}
          <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
            <input
              type="checkbox"
              checked={data.acceptsFinancialAssistance}
              onChange={(e) => onChange({ ...data, acceptsFinancialAssistance: e.target.checked })}
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 block">
                We Accept Financial Assistance Programs
              </span>
              <span className="text-xs text-gray-600">
                Check this if you accept insurance, government programs, or other financial assistance
              </span>
            </div>
          </label>

          {/* Financial Assistance Types */}
          {data.acceptsFinancialAssistance && (
            <div className="pl-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Select all that apply:</p>
              {FINANCIAL_ASSISTANCE_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                    data.financialAssistanceTypes.includes(type.id)
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.financialAssistanceTypes.includes(type.id)}
                    onChange={() => toggleFinancialAssistance(type.id)}
                    className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900 block">{type.label}</span>
                    <span className="text-xs text-gray-600">{type.description}</span>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Payment Plans */}
          <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
            <input
              type="checkbox"
              checked={data.offersPaymentPlans}
              onChange={(e) => onChange({ ...data, offersPaymentPlans: e.target.checked })}
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 block mb-2">
                We Offer Flexible Payment Plans
              </span>
              {data.offersPaymentPlans && (
                <textarea
                  value={data.paymentPlanDetails}
                  onChange={(e) => onChange({ ...data, paymentPlanDetails: e.target.value })}
                  placeholder="Describe your payment plan options (e.g., 'Monthly installments available', 'Interest-free for first 6 months', etc.)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Pricing Summary */}
      {(data.privateRoomMin || data.semiPrivateRoomMin || data.includedServices.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">Pricing Information Added</h4>
              <p className="text-sm text-green-800">
                Great job! You&apos;ve added{" "}
                {data.includedServices.length > 0 && `${data.includedServices.length} included services`}
                {data.additionalServices.length > 0 && `, ${data.additionalServices.length} additional services`}
                . Transparent pricing helps families budget and builds trust.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
