"use client";

import { useState } from "react";

export interface Award {
  name: string;
  year: string;
  description: string;
}

export interface CertificationsLicensingData {
  // License information
  licensed: boolean;
  licenseNumber: string;

  // Certificate uploads (URLs)
  certificateUrls: string[];

  // Accreditations
  accreditations: string[];

  // Awards & Recognition
  awards: Award[];
}

interface CertificationsLicensingSectionProps {
  data: CertificationsLicensingData;
  onChange: (data: CertificationsLicensingData) => void;
}

const ACCREDITATION_OPTIONS = [
  {
    id: "joint_commission",
    label: "Joint Commission Accredited",
    description: "The Gold Seal of Approval® for healthcare quality",
    icon: "🏅",
  },
  {
    id: "carf",
    label: "CARF Accredited",
    description: "Commission on Accreditation of Rehabilitation Facilities",
    icon: "⭐",
  },
  {
    id: "alfa",
    label: "ALFA Member",
    description: "Assisted Living Federation of America",
    icon: "🏛️",
  },
  {
    id: "leading_age",
    label: "LeadingAge Member",
    description: "Nonprofit organization for aging services",
    icon: "🌟",
  },
  {
    id: "state_licensed",
    label: "State Licensed",
    description: "Licensed by state health department",
    icon: "📋",
  },
  {
    id: "medicare_certified",
    label: "Medicare Certified",
    description: "Certified to accept Medicare payments",
    icon: "💳",
  },
  {
    id: "medicaid_certified",
    label: "Medicaid Certified",
    description: "Certified to accept Medicaid payments",
    icon: "💳",
  },
  {
    id: "bbb_accredited",
    label: "BBB Accredited",
    description: "Better Business Bureau accredited business",
    icon: "✓",
  },
  {
    id: "memory_care_certified",
    label: "Memory Care Certified",
    description: "Specialized certification for dementia care",
    icon: "🧠",
  },
];

const CERTIFICATE_TYPES = [
  { id: "state_license", label: "State License", icon: "📄" },
  { id: "medicare_cert", label: "Medicare Certification", icon: "🏥" },
  { id: "medicaid_cert", label: "Medicaid Certification", icon: "🏥" },
  { id: "accreditation", label: "Accreditation Certificate", icon: "🏆" },
  { id: "insurance", label: "Insurance Certificate", icon: "🛡️" },
  { id: "staff_cert", label: "Staff Certification", icon: "👥" },
  { id: "other", label: "Other Certificate", icon: "📎" },
];

export default function CertificationsLicensingSection({
  data,
  onChange,
}: CertificationsLicensingSectionProps) {
  const [newAward, setNewAward] = useState<Award>({
    name: "",
    year: "",
    description: "",
  });
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  const toggleAccreditation = (accreditationId: string) => {
    const newAccreditations = data.accreditations.includes(accreditationId)
      ? data.accreditations.filter((a) => a !== accreditationId)
      : [...data.accreditations, accreditationId];
    onChange({ ...data, accreditations: newAccreditations });
  };

  const addAward = () => {
    if (newAward.name.trim() && newAward.year.trim()) {
      onChange({
        ...data,
        awards: [...data.awards, { ...newAward }],
      });
      setNewAward({ name: "", year: "", description: "" });
    }
  };

  const removeAward = (index: number) => {
    onChange({
      ...data,
      awards: data.awards.filter((_, i) => i !== index),
    });
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingCertificate(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      const newUrls = result.urls || [];

      onChange({
        ...data,
        certificateUrls: [...data.certificateUrls, ...newUrls],
      });
    } catch (error) {
      console.error("Error uploading certificates:", error);
      alert("Failed to upload certificates. Please try again.");
    } finally {
      setUploadingCertificate(false);
    }
  };

  const removeCertificate = (index: number) => {
    onChange({
      ...data,
      certificateUrls: data.certificateUrls.filter((_, i) => i !== index),
    });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      {/* License Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          License Information
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide your licensing details to build trust with families.
        </p>

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={data.licensed}
              onChange={(e) => onChange({ ...data, licensed: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-900">
              Licensed by state health department
            </span>
          </label>

          {data.licensed && (
            <div>
              <label
                htmlFor="license-number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                License Number
              </label>
              <input
                type="text"
                id="license-number"
                value={data.licenseNumber}
                onChange={(e) =>
                  onChange({ ...data, licenseNumber: e.target.value })
                }
                placeholder="e.g., AL-12345678"
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Certificate Uploads */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Certificate Uploads
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload copies of your licenses, certifications, and accreditations. This helps families verify your credentials.
        </p>

        <div className="mb-4">
          <label
            htmlFor="certificate-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-400 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {uploadingCertificate ? "Uploading..." : "Upload Certificates"}
            </span>
          </label>
          <input
            type="file"
            id="certificate-upload"
            accept="image/*,.pdf"
            multiple
            onChange={handleCertificateUpload}
            disabled={uploadingCertificate}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload state licenses, Medicare/Medicaid certifications, accreditations, insurance certificates, or staff certifications. Accepts images and PDFs.
          </p>
        </div>

        {/* Certificate Grid */}
        {data.certificateUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.certificateUrls.map((url, index) => (
              <div
                key={index}
                className="relative group border-2 border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                  {url.endsWith(".pdf") ? (
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-red-500 mx-auto mb-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-gray-600">PDF</span>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`Certificate ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  Certificate {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeCertificate(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accreditations */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Accreditations & Certifications
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all accreditations and certifications that apply to your facility.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ACCREDITATION_OPTIONS.map((accreditation) => (
            <label
              key={accreditation.id}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.accreditations.includes(accreditation.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={data.accreditations.includes(accreditation.id)}
                onChange={() => toggleAccreditation(accreditation.id)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{accreditation.icon}</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {accreditation.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {accreditation.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Awards & Recognition
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Showcase awards and recognition your facility has received. This helps demonstrate your commitment to excellence.
        </p>

        {/* Existing Awards */}
        {data.awards.length > 0 && (
          <div className="space-y-3 mb-4">
            {data.awards.map((award, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white"
              >
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {award.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Year: {award.year}
                      </p>
                      {award.description && (
                        <p className="text-sm text-gray-700 mt-2">
                          {award.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAward(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remove award"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Award */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Add New Award
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label
                htmlFor="award-name"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Award Name *
              </label>
              <input
                type="text"
                id="award-name"
                value={newAward.name}
                onChange={(e) =>
                  setNewAward({ ...newAward, name: e.target.value })
                }
                placeholder="e.g., Best Assisted Living Facility 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                htmlFor="award-year"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Year Received *
              </label>
              <select
                id="award-year"
                value={newAward.year}
                onChange={(e) =>
                  setNewAward({ ...newAward, year: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label
              htmlFor="award-description"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="award-description"
              value={newAward.description}
              onChange={(e) =>
                setNewAward({ ...newAward, description: e.target.value })
              }
              placeholder="Brief description of the award and what it recognizes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={addAward}
            disabled={!newAward.name.trim() || !newAward.year.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Award
          </button>
        </div>
      </div>

      {/* Summary */}
      {(data.licensed ||
        data.certificateUrls.length > 0 ||
        data.accreditations.length > 0 ||
        data.awards.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Certifications & Licensing Summary
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                {data.licensed && data.licenseNumber && (
                  <p>• License Number: {data.licenseNumber}</p>
                )}
                {data.certificateUrls.length > 0 && (
                  <p>• {data.certificateUrls.length} certificate(s) uploaded</p>
                )}
                {data.accreditations.length > 0 && (
                  <p>• {data.accreditations.length} accreditation(s) selected</p>
                )}
                {data.awards.length > 0 && (
                  <p>• {data.awards.length} award(s) listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
