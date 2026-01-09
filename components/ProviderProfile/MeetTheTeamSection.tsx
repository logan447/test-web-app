"use client";

import { useState } from "react";

export interface TeamMember {
  id: string;
  role: string;
  name: string;
  photoUrl: string;
  bio: string;
}

export interface MeetTheTeamData {
  teamMembers: TeamMember[];
}

interface MeetTheTeamSectionProps {
  data: MeetTheTeamData;
  onChange: (data: MeetTheTeamData) => void;
}

const KEY_ROLES = [
  { value: "executive_director", label: "Executive Director", icon: "👔" },
  { value: "director_of_nursing", label: "Director of Nursing", icon: "👩‍⚕️" },
  { value: "activity_director", label: "Activity Director", icon: "🎨" },
  { value: "chef", label: "Executive Chef", icon: "👨‍🍳" },
  { value: "other", label: "Other Team Member", icon: "👤" },
];

export default function MeetTheTeamSection({
  data,
  onChange,
}: MeetTheTeamSectionProps) {
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      role: "",
      name: "",
      photoUrl: "",
      bio: "",
    };
    onChange({
      ...data,
      teamMembers: [...data.teamMembers, newMember],
    });
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    onChange({
      ...data,
      teamMembers: data.teamMembers.map((member) =>
        member.id === id ? { ...member, ...updates } : member
      ),
    });
  };

  const removeTeamMember = (id: string) => {
    onChange({
      ...data,
      teamMembers: data.teamMembers.filter((member) => member.id !== id),
    });
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    memberId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFor(memberId);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("/api/upload/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      const photoUrl = result.urls?.[0] || "";

      updateTeamMember(memberId, { photoUrl });
    } catch (error) {
      console.error("Photo upload failed:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingFor(null);
    }
  };

  const getRoleLabel = (roleValue: string) => {
    const role = KEY_ROLES.find((r) => r.value === roleValue);
    return role ? `${role.icon} ${role.label}` : roleValue;
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Meet the Team
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Introduce your leadership and key staff members. Personal profiles help families feel connected and build trust.
        </p>
      </div>

      {/* Team Members List */}
      {data.teamMembers.length > 0 && (
        <div className="space-y-6">
          {data.teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="border border-gray-300 rounded-lg p-6 bg-white relative"
            >
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeTeamMember(member.id)}
                className="absolute top-4 right-4 text-red-600 hover:text-red-700 text-sm font-medium"
                aria-label="Remove team member"
              >
                ✕ Remove
              </button>

              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Team Member {index + 1}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Role */}
                  <div>
                    <label
                      htmlFor={`role-${member.id}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Role/Position *
                    </label>
                    <select
                      id={`role-${member.id}`}
                      value={member.role}
                      onChange={(e) =>
                        updateTeamMember(member.id, { role: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a role</option>
                      {KEY_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.icon} {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor={`name-${member.id}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id={`name-${member.id}`}
                      value={member.name}
                      onChange={(e) =>
                        updateTeamMember(member.id, { name: e.target.value })
                      }
                      placeholder="e.g., Sarah Johnson, RN"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label
                      htmlFor={`photo-${member.id}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      📷 Profile Photo
                    </label>
                    {member.photoUrl ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={member.photoUrl}
                          alt={member.name || "Team member"}
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor={`photo-${member.id}`}
                            className="text-sm text-primary-600 hover:text-primary-700 cursor-pointer font-medium"
                          >
                            Change Photo
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              updateTeamMember(member.id, { photoUrl: "" })
                            }
                            className="text-sm text-red-600 hover:text-red-700 text-left"
                          >
                            Remove Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor={`photo-${member.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors text-sm"
                        >
                          {uploadingFor === member.id ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              📤 Upload Photo
                            </>
                          )}
                        </label>
                      </div>
                    )}
                    <input
                      type="file"
                      id={`photo-${member.id}`}
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, member.id)}
                      disabled={uploadingFor === member.id}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Professional headshot recommended (square format, 500x500px minimum)
                    </p>
                  </div>
                </div>

                {/* Right Column - Bio */}
                <div>
                  <label
                    htmlFor={`bio-${member.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bio/Background
                  </label>
                  <textarea
                    id={`bio-${member.id}`}
                    value={member.bio}
                    onChange={(e) =>
                      updateTeamMember(member.id, { bio: e.target.value })
                    }
                    placeholder="Example: Sarah has been our Executive Director for 8 years and brings over 20 years of healthcare experience. She's a registered nurse with a Master's in Healthcare Administration and is passionate about creating a homelike environment where residents thrive. Sarah loves getting to know each resident personally and often joins in on activities. Outside of work, she enjoys hiking and spending time with her two golden retrievers."
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Include experience, education, passions, and personal touch (150-250 words recommended).
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Team Member Button */}
      <button
        type="button"
        onClick={addTeamMember}
        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors font-medium"
      >
        + Add Team Member
      </button>

      {/* Empty State */}
      {data.teamMembers.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">👥</div>
          <h4 className="text-md font-semibold text-blue-900 mb-2">
            No Team Members Added Yet
          </h4>
          <p className="text-sm text-blue-800 mb-4">
            Introduce your leadership team and key staff members. Profiles with photos and bios build trust with families.
          </p>
          <p className="text-xs text-blue-700">
            💡 Tip: Start with your Executive Director and Director of Nursing. They&apos;re the faces families want to see!
          </p>
        </div>
      )}

      {/* Summary */}
      {data.teamMembers.length > 0 && (
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
                Team Profile Summary
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• {data.teamMembers.length} team member(s) added</p>
                <p>
                  • {data.teamMembers.filter((m) => m.photoUrl).length} with
                  photos
                </p>
                <p>
                  • Roles:{" "}
                  {data.teamMembers
                    .filter((m) => m.role)
                    .map((m) => KEY_ROLES.find((r) => r.value === m.role)?.label)
                    .filter(Boolean)
                    .join(", ") || "None selected"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
