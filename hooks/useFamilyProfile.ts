"use client";

import { useState, useEffect, useCallback } from "react";

export interface ProfileSummary {
  careTypes: string[];
  location: string;
  budgetRange: string | null;
  timeline: string | null;
  isComplete: boolean;
  missingFields: string[];
  hasProfile: boolean;
}

interface FamilyProfileData {
  id: string;
  careTypes: string[];
  city: string | null;
  state: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  description: string | null;
  missingCardMinimumFields?: string[];
  canEnableVisibility?: boolean;
}

export function useFamilyProfile() {
  const [profile, setProfile] = useState<FamilyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/family-profiles/me");

      if (response.status === 404) {
        // No profile exists
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getProfileSummary = useCallback((): ProfileSummary => {
    if (!profile) {
      return {
        careTypes: [],
        location: "",
        budgetRange: null,
        timeline: null,
        isComplete: false,
        missingFields: ["Care profile not created"],
        hasProfile: false,
      };
    }

    // Use API-provided missing fields if available
    const missingFields = profile.missingCardMinimumFields || [];

    // Format location
    const location = profile.city && profile.state
      ? `${profile.city}, ${profile.state}`
      : "";

    // Format budget range
    let budgetRange: string | null = null;
    if (profile.budgetMin && profile.budgetMax) {
      budgetRange = `$${profile.budgetMin.toLocaleString()} - $${profile.budgetMax.toLocaleString()}/mo`;
    } else if (profile.budgetMin) {
      budgetRange = `$${profile.budgetMin.toLocaleString()}+/mo`;
    } else if (profile.budgetMax) {
      budgetRange = `Up to $${profile.budgetMax.toLocaleString()}/mo`;
    }

    return {
      careTypes: profile.careTypes || [],
      location,
      budgetRange,
      timeline: profile.timeline,
      isComplete: missingFields.length === 0,
      missingFields,
      hasProfile: true,
    };
  }, [profile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    getProfileSummary,
  };
}

// Helper function to determine engagement type based on provider type
export function getEngagementType(providerType: string): "consultation" | "tour" | "interview" {
  const facilityTypes = [
    "ASSISTED_LIVING",
    "MEMORY_CARE",
    "NURSING_HOME",
    "INDEPENDENT_LIVING",
    "REHABILITATION",
  ];

  const caregiverTypes = ["INDEPENDENT_CAREGIVER"];

  if (facilityTypes.includes(providerType)) {
    return "tour";
  }
  if (caregiverTypes.includes(providerType)) {
    return "interview";
  }
  return "consultation";
}
