"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";

type CareProfile = {
  id: string;
  careTypes: string[];
  location: string;
  city: string;
  state: string;
  zipCode: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  insurance: string | null;
  description: string | null;
  isPublic: boolean;
};

export default function CareProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CareProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/care-profiles");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile(data);
          setIsPublic(data.isPublic || false);
        } else {
          setEditing(true); // No profile exists, start in edit mode
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const careTypes = formData.getAll("careTypes");

    const data = {
      careTypes,
      location: formData.get("location"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      budgetMin: formData.get("budgetMin") ? parseInt(formData.get("budgetMin") as string) : null,
      budgetMax: formData.get("budgetMax") ? parseInt(formData.get("budgetMax") as string) : null,
      timeline: formData.get("timeline") || null,
      insurance: formData.get("insurance") || null,
      description: formData.get("description") || null,
      isPublic: isPublic,
    };

    try {
      const method = profile ? "PATCH" : "POST";
      const response = await fetch("/api/care-profiles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const savedProfile = await response.json();
      setProfile(savedProfile);
      setEditing(false);
    } catch (err) {
      setError("Failed to save care profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatCareType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {profile ? "My Care Profile" : "Create Care Profile"}
          </h1>
          {profile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Care Types Needed */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Types Needed</h2>
              <div className="space-y-2">
                {[
                  { value: "COMPANION_CARE", label: "Companion Care" },
                  { value: "PERSONAL_CARE", label: "Personal Care" },
                  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
                  { value: "MEMORY_CARE", label: "Memory Care" },
                  { value: "HOSPICE_CARE", label: "Hospice Care" },
                  { value: "RESPITE_CARE", label: "Respite Care" },
                  { value: "LIVE_IN_CARE", label: "Live-In Care" },
                ].map((care) => (
                  <label key={care.value} className="flex items-center">
                    <input
                      type="checkbox"
                      name="careTypes"
                      value={care.value}
                      defaultChecked={profile?.careTypes.includes(care.value)}
                      className="rounded border-gray-300 text-primary-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">{care.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address/Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    defaultValue={profile?.location || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      defaultValue={profile?.city || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      maxLength={2}
                      defaultValue={profile?.state || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      defaultValue={profile?.zipCode || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Range</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Budget ($/month)
                  </label>
                  <input
                    type="number"
                    name="budgetMin"
                    defaultValue={profile?.budgetMin || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Budget ($/month)
                  </label>
                  <input
                    type="number"
                    name="budgetMax"
                    defaultValue={profile?.budgetMax || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeline
                  </label>
                  <input
                    type="text"
                    name="timeline"
                    defaultValue={profile?.timeline || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Immediate, Within 2 weeks, Within 1 month"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance
                  </label>
                  <input
                    type="text"
                    name="insurance"
                    defaultValue={profile?.insurance || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Medicare, Medicaid, Private Insurance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description & Special Needs
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={profile?.description || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Tell providers about your loved one's needs, preferences, or special requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Profile Visibility */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Visibility</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-gray-900">
                      Make my profile visible to all providers
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      When enabled, providers can discover and reach out to you through the Browse Care Requests page.
                      When disabled, only providers you directly contact will see your profile.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {saving ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
              </button>
              {profile && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : profile ? (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Care Types */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Care Types Needed</h2>
              <div className="flex flex-wrap gap-2">
                {profile.careTypes.map((care) => (
                  <span
                    key={care}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {formatCareType(care)}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
              <p className="text-gray-700">{profile.location}</p>
              <p className="text-gray-600">
                {profile.city}, {profile.state} {profile.zipCode}
              </p>
            </div>

            {/* Budget */}
            {(profile.budgetMin || profile.budgetMax) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Budget</h2>
                <p className="text-gray-700">
                  ${profile.budgetMin?.toLocaleString() || "N/A"} - ${profile.budgetMax?.toLocaleString() || "N/A"} per month
                </p>
              </div>
            )}

            {/* Timeline */}
            {profile.timeline && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Timeline</h2>
                <p className="text-gray-700">{profile.timeline}</p>
              </div>
            )}

            {/* Insurance */}
            {profile.insurance && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Insurance</h2>
                <p className="text-gray-700">{profile.insurance}</p>
              </div>
            )}

            {/* Description */}
            {profile.description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description & Special Needs</h2>
                <p className="text-gray-700 whitespace-pre-line">{profile.description}</p>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
