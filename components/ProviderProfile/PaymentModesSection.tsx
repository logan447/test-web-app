"use client";

import { useState } from "react";

// Payment modes as defined in Sprint 2
export const PAYMENT_MODES = {
  PRIVATE_PAY: {
    value: "PRIVATE_PAY",
    label: "Private Pay",
    description: "Out-of-pocket payment from residents or families",
    icon: "dollar",
  },
  MEDICARE: {
    value: "MEDICARE",
    label: "Medicare",
    description: "Federal health insurance for 65+ or disabilities",
    icon: "shield",
  },
  MEDICAID: {
    value: "MEDICAID",
    label: "Medicaid",
    description: "State/federal program for limited income seniors",
    icon: "heart",
  },
  LONG_TERM_CARE_INSURANCE: {
    value: "LONG_TERM_CARE_INSURANCE",
    label: "Long-Term Care Insurance",
    description: "Private insurance for long-term care costs",
    icon: "document",
  },
  VA_BENEFITS: {
    value: "VA_BENEFITS",
    label: "VA Benefits",
    description: "Benefits for veterans and eligible dependents",
    icon: "star",
  },
  STATE_WAIVER_PROGRAM: {
    value: "STATE_WAIVER_PROGRAM",
    label: "State Waiver Programs",
    description: "Home and community-based service waivers",
    icon: "location",
  },
} as const;

export type PaymentMode = keyof typeof PAYMENT_MODES;

export interface PaymentModesData {
  paymentModesAccepted: PaymentMode[];
  stateWaiverPrograms: string[];
  insuranceNetworks: string[];
}

interface PaymentModesSectionProps {
  data: PaymentModesData;
  onChange: (data: PaymentModesData) => void;
}

export default function PaymentModesSection({
  data,
  onChange,
}: PaymentModesSectionProps) {
  const [newWaiverProgram, setNewWaiverProgram] = useState("");
  const [newInsuranceNetwork, setNewInsuranceNetwork] = useState("");

  const togglePaymentMode = (mode: PaymentMode) => {
    const currentModes = data.paymentModesAccepted;
    const newModes = currentModes.includes(mode)
      ? currentModes.filter((m) => m !== mode)
      : [...currentModes, mode];
    onChange({ ...data, paymentModesAccepted: newModes });
  };

  const addWaiverProgram = () => {
    if (newWaiverProgram.trim() && !data.stateWaiverPrograms.includes(newWaiverProgram.trim())) {
      onChange({
        ...data,
        stateWaiverPrograms: [...data.stateWaiverPrograms, newWaiverProgram.trim()],
      });
      setNewWaiverProgram("");
    }
  };

  const removeWaiverProgram = (program: string) => {
    onChange({
      ...data,
      stateWaiverPrograms: data.stateWaiverPrograms.filter((p) => p !== program),
    });
  };

  const addInsuranceNetwork = () => {
    if (newInsuranceNetwork.trim() && !data.insuranceNetworks.includes(newInsuranceNetwork.trim())) {
      onChange({
        ...data,
        insuranceNetworks: [...data.insuranceNetworks, newInsuranceNetwork.trim()],
      });
      setNewInsuranceNetwork("");
    }
  };

  const removeInsuranceNetwork = (network: string) => {
    onChange({
      ...data,
      insuranceNetworks: data.insuranceNetworks.filter((n) => n !== network),
    });
  };

  const showWaiverDetails = data.paymentModesAccepted.includes("STATE_WAIVER_PROGRAM");
  const showInsuranceDetails = data.paymentModesAccepted.includes("LONG_TERM_CARE_INSURANCE");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Methods Accepted</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all payment methods your facility accepts. This helps families understand their options and is required for profile visibility.
        </p>

        {/* Required indicator */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-amber-800">
              Required: Select at least one payment method to make your profile visible
            </span>
          </div>
        </div>

        {/* Payment mode checkboxes */}
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(PAYMENT_MODES).map((mode) => (
            <label
              key={mode.value}
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                data.paymentModesAccepted.includes(mode.value as PaymentMode)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={data.paymentModesAccepted.includes(mode.value as PaymentMode)}
                onChange={() => togglePaymentMode(mode.value as PaymentMode)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{mode.label}</span>
                <p className="text-xs text-gray-500 mt-1">{mode.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* State Waiver Programs (conditional) */}
      {showWaiverDetails && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">State Waiver Programs</h4>
          <p className="text-sm text-gray-600 mb-3">
            Specify which state waiver programs you accept (e.g., HCBS Waiver, Elderly Waiver, etc.)
          </p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newWaiverProgram}
              onChange={(e) => setNewWaiverProgram(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addWaiverProgram();
                }
              }}
              placeholder="e.g., HCBS Waiver, Community First Choice"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={addWaiverProgram}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add
            </button>
          </div>

          {data.stateWaiverPrograms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.stateWaiverPrograms.map((program) => (
                <span
                  key={program}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {program}
                  <button
                    type="button"
                    onClick={() => removeWaiverProgram(program)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insurance Networks (conditional) */}
      {showInsuranceDetails && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Insurance Network Affiliations</h4>
          <p className="text-sm text-gray-600 mb-3">
            List the long-term care insurance networks you are affiliated with
          </p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newInsuranceNetwork}
              onChange={(e) => setNewInsuranceNetwork(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInsuranceNetwork();
                }
              }}
              placeholder="e.g., Genworth, John Hancock, Mutual of Omaha"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={addInsuranceNetwork}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add
            </button>
          </div>

          {data.insuranceNetworks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.insuranceNetworks.map((network) => (
                <span
                  key={network}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {network}
                  <button
                    type="button"
                    onClick={() => removeInsuranceNetwork(network)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
