import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  meetsVisibilityRequirements,
  getMissingRequiredFields,
  calculateProviderCompletionPercentage,
  getProviderCompletionSummary,
} from "@/lib/providerProfileCompletion";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Include completion summary in response
    const completionSummary = getProviderCompletionSummary(provider);

    return NextResponse.json({
      ...provider,
      _completion: completionSummary,
    });
  } catch (error) {
    console.error("Error fetching provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      providerType,
      description,
      careTypesOffered,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      website,
      yearsInBusiness,
      licenseNumber,
      active,
      availableForFamilies,
      availableForOrganizations,
    } = body;

    // Check if provider already exists
    const existingProvider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: "Provider profile already exists" },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.create({
      data: {
        userId: session.user.id,
        name,
        providerType,
        description,
        careTypesOffered,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        website,
        yearsInBusiness,
        licenseNumber,
        active: active ?? true,
        availableForFamilies: availableForFamilies ?? true,
        availableForOrganizations: availableForOrganizations ?? false,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/providers/me
 * Update provider profile with visibility gate enforcement
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing provider
    const existingProvider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Extract all updatable fields
    const {
      // Basic info
      name,
      description,
      website,

      // Contact
      phone,
      email,

      // Location
      address,
      city,
      state,
      zipCode,
      serviceRadius,
      latitude,
      longitude,
      neighborhoodDescription,
      nearbyAmenities,

      // Services
      careTypesOffered,
      detailedMedicalServices,
      detailedPersonalCareServices,
      detailedDailyLivingServices,
      detailedMemoryCareServices,
      detailedSocialRecServices,

      // Payment - Sprint 2 additions
      paymentModesAccepted,
      stateWaiverPrograms,
      insuranceNetworks,
      priceMin,
      priceMax,
      priceDescription,
      acceptsFinancialAssistance,
      financialAssistanceTypes,
      offersPaymentPlans,
      paymentPlanDetails,

      // Pricing structure
      privateRoomMin,
      privateRoomMax,
      semiPrivateRoomMin,
      semiPrivateRoomMax,
      includedServices,
      additionalServicesJson,
      communityFee,
      securityDeposit,
      applicationFee,

      // Photos
      photos,
      coverPhoto,
      virtualTourUrl,
      virtualTourType,
      brochureUrl,
      floorPlanUrls,

      // Licensing
      licensed,
      licenseNumber,
      certifications,
      certificateUrls,
      accreditations,
      awardsJson,
      insuranceVerified,
      backgroundChecked,

      // Capacity
      totalCapacity,
      availableSpots,
      waitlistAvailable,

      // Staff
      staffToResidentRatio,
      daytimeStaffRatio,
      eveningStaffRatio,
      nightStaffRatio,
      staffCredentials,
      staffTrainingDescription,
      hasRNOnSite,
      hasLVNOnSite,
      hasOnCallPhysician,
      hasPharmacyPartnership,
      allStaffBackgroundChecked,
      visitingDoctorFrequency,
      caregiverTraining,
      languagesSpoken,

      // Amenities
      roomFeatures,
      commonAreas,
      medicalServices,
      medicalAmenities,
      activitiesOffered,
      dietaryOptions,
      safetySecurityFeatures,

      // Specialty
      hasMemoryCare,
      hasRespiteCare,
      hasHospiceCare,
      specialtyPrograms,
      specialtyProgramsJson,

      // Policies
      petPolicy,
      petPolicyDetails,
      visitorPolicy,
      smokingPolicy,
      hasTrialPeriod,
      trialPeriodDuration,

      // About
      yearsInBusiness,
      establishedYear,
      facilityHistory,
      missionStatement,
      whatMakesUsUnique,
      teamMembersJson,

      // Availability
      active,
      availableForFamilies,
      availableForOrganizations,

      // Caregiver work preferences (Sprint 5)
      workPreferences,
      preferredEmployers,
      availabilityStart,

      // Visibility request
      isVisible,
    } = body;

    // Build update data (only include defined fields)
    const updateData: Record<string, unknown> = {};

    // Helper to add field if defined
    const addIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    };

    // Basic info
    addIfDefined("name", name);
    addIfDefined("description", description);
    addIfDefined("website", website);

    // Contact
    addIfDefined("phone", phone);
    addIfDefined("email", email);

    // Location
    addIfDefined("address", address);
    addIfDefined("city", city);
    addIfDefined("state", state);
    addIfDefined("zipCode", zipCode);
    addIfDefined("serviceRadius", serviceRadius);
    addIfDefined("latitude", latitude);
    addIfDefined("longitude", longitude);
    addIfDefined("neighborhoodDescription", neighborhoodDescription);
    addIfDefined("nearbyAmenities", nearbyAmenities);

    // Services
    addIfDefined("careTypesOffered", careTypesOffered);
    addIfDefined("detailedMedicalServices", detailedMedicalServices);
    addIfDefined("detailedPersonalCareServices", detailedPersonalCareServices);
    addIfDefined("detailedDailyLivingServices", detailedDailyLivingServices);
    addIfDefined("detailedMemoryCareServices", detailedMemoryCareServices);
    addIfDefined("detailedSocialRecServices", detailedSocialRecServices);

    // Payment
    addIfDefined("paymentModesAccepted", paymentModesAccepted);
    addIfDefined("stateWaiverPrograms", stateWaiverPrograms);
    addIfDefined("insuranceNetworks", insuranceNetworks);
    addIfDefined("priceMin", priceMin);
    addIfDefined("priceMax", priceMax);
    addIfDefined("priceDescription", priceDescription);
    addIfDefined("acceptsFinancialAssistance", acceptsFinancialAssistance);
    addIfDefined("financialAssistanceTypes", financialAssistanceTypes);
    addIfDefined("offersPaymentPlans", offersPaymentPlans);
    addIfDefined("paymentPlanDetails", paymentPlanDetails);

    // Pricing structure
    addIfDefined("privateRoomMin", privateRoomMin);
    addIfDefined("privateRoomMax", privateRoomMax);
    addIfDefined("semiPrivateRoomMin", semiPrivateRoomMin);
    addIfDefined("semiPrivateRoomMax", semiPrivateRoomMax);
    addIfDefined("includedServices", includedServices);
    addIfDefined("additionalServicesJson", additionalServicesJson);
    addIfDefined("communityFee", communityFee);
    addIfDefined("securityDeposit", securityDeposit);
    addIfDefined("applicationFee", applicationFee);

    // Photos
    addIfDefined("photos", photos);
    addIfDefined("coverPhoto", coverPhoto);
    addIfDefined("virtualTourUrl", virtualTourUrl);
    addIfDefined("virtualTourType", virtualTourType);
    addIfDefined("brochureUrl", brochureUrl);
    addIfDefined("floorPlanUrls", floorPlanUrls);

    // Licensing
    addIfDefined("licensed", licensed);
    addIfDefined("licenseNumber", licenseNumber);
    addIfDefined("certifications", certifications);
    addIfDefined("certificateUrls", certificateUrls);
    addIfDefined("accreditations", accreditations);
    addIfDefined("awardsJson", awardsJson);
    addIfDefined("insuranceVerified", insuranceVerified);
    addIfDefined("backgroundChecked", backgroundChecked);

    // Capacity
    addIfDefined("totalCapacity", totalCapacity);
    addIfDefined("availableSpots", availableSpots);
    addIfDefined("waitlistAvailable", waitlistAvailable);

    // Staff
    addIfDefined("staffToResidentRatio", staffToResidentRatio);
    addIfDefined("daytimeStaffRatio", daytimeStaffRatio);
    addIfDefined("eveningStaffRatio", eveningStaffRatio);
    addIfDefined("nightStaffRatio", nightStaffRatio);
    addIfDefined("staffCredentials", staffCredentials);
    addIfDefined("staffTrainingDescription", staffTrainingDescription);
    addIfDefined("hasRNOnSite", hasRNOnSite);
    addIfDefined("hasLVNOnSite", hasLVNOnSite);
    addIfDefined("hasOnCallPhysician", hasOnCallPhysician);
    addIfDefined("hasPharmacyPartnership", hasPharmacyPartnership);
    addIfDefined("allStaffBackgroundChecked", allStaffBackgroundChecked);
    addIfDefined("visitingDoctorFrequency", visitingDoctorFrequency);
    addIfDefined("caregiverTraining", caregiverTraining);
    addIfDefined("languagesSpoken", languagesSpoken);

    // Amenities
    addIfDefined("roomFeatures", roomFeatures);
    addIfDefined("commonAreas", commonAreas);
    addIfDefined("medicalServices", medicalServices);
    addIfDefined("medicalAmenities", medicalAmenities);
    addIfDefined("activitiesOffered", activitiesOffered);
    addIfDefined("dietaryOptions", dietaryOptions);
    addIfDefined("safetySecurityFeatures", safetySecurityFeatures);

    // Specialty
    addIfDefined("hasMemoryCare", hasMemoryCare);
    addIfDefined("hasRespiteCare", hasRespiteCare);
    addIfDefined("hasHospiceCare", hasHospiceCare);
    addIfDefined("specialtyPrograms", specialtyPrograms);
    addIfDefined("specialtyProgramsJson", specialtyProgramsJson);

    // Policies
    addIfDefined("petPolicy", petPolicy);
    addIfDefined("petPolicyDetails", petPolicyDetails);
    addIfDefined("visitorPolicy", visitorPolicy);
    addIfDefined("smokingPolicy", smokingPolicy);
    addIfDefined("hasTrialPeriod", hasTrialPeriod);
    addIfDefined("trialPeriodDuration", trialPeriodDuration);

    // About
    addIfDefined("yearsInBusiness", yearsInBusiness);
    addIfDefined("establishedYear", establishedYear);
    addIfDefined("facilityHistory", facilityHistory);
    addIfDefined("missionStatement", missionStatement);
    addIfDefined("whatMakesUsUnique", whatMakesUsUnique);
    addIfDefined("teamMembersJson", teamMembersJson);

    // Availability
    addIfDefined("active", active);
    addIfDefined("availableForFamilies", availableForFamilies);
    addIfDefined("availableForOrganizations", availableForOrganizations);

    // Caregiver work preferences (Sprint 5)
    addIfDefined("workPreferences", workPreferences);
    addIfDefined("preferredEmployers", preferredEmployers);
    addIfDefined("availabilityStart", availabilityStart);

    // Create merged data to check visibility requirements
    const mergedData = { ...existingProvider, ...updateData };

    // Calculate new completion percentage
    const completionPercentage = calculateProviderCompletionPercentage(mergedData);
    updateData.completionPercentage = completionPercentage;

    // Handle visibility request with gate enforcement
    if (isVisible === true) {
      // Check if visibility requirements are met
      if (!meetsVisibilityRequirements(mergedData)) {
        const missingFields = getMissingRequiredFields(mergedData);
        return NextResponse.json(
          {
            error: "Cannot enable visibility - required fields missing",
            missingFields,
            message: `Please complete the following fields to make your profile visible: ${missingFields.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Visibility can be enabled
      updateData.isVisible = true;

      // Track when visibility was first unlocked
      if (!existingProvider.visibilityUnlockedAt) {
        updateData.visibilityUnlockedAt = new Date();
      }
    } else if (isVisible === false) {
      // Turning off visibility is always allowed
      updateData.isVisible = false;
    }

    // Update provider
    const updatedProvider = await prisma.provider.update({
      where: { id: existingProvider.id },
      data: updateData,
    });

    // Get updated completion summary
    const completionSummary = getProviderCompletionSummary(updatedProvider);

    return NextResponse.json({
      ...updatedProvider,
      _completion: completionSummary,
    });
  } catch (error) {
    console.error("Error updating provider:", error);
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    );
  }
}
