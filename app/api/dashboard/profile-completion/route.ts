import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CompletionItem {
  label: string;
  completed: boolean;
  description: string;
  action: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const activeMode = session.user.activeMode || userRole;

    const items: CompletionItem[] = [];
    let completedCount = 0;
    let totalCount = 0;

    if (activeMode === "FAMILY") {
      // Check family profile completion
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: userId },
      });

      // 1. Basic Information (Loved One Details)
      const hasBasicInfo = !!(
        familyProfile?.lovedOneName &&
        familyProfile?.ageRange &&
        familyProfile?.gender
      );
      items.push({
        label: "Basic Information",
        completed: hasBasicInfo,
        description: "Add your loved one's name, age, and gender",
        action: "Complete basic info",
      });
      if (hasBasicInfo) completedCount++;
      totalCount++;

      // 2. Care Needs
      const hasCareNeeds = !!(
        familyProfile?.careTypes &&
        Array.isArray(familyProfile.careTypes) &&
        familyProfile.careTypes.length > 0
      );
      items.push({
        label: "Care Needs",
        completed: hasCareNeeds,
        description: "Specify the type of care needed",
        action: "Add care needs",
      });
      if (hasCareNeeds) completedCount++;
      totalCount++;

      // 3. Medical Conditions
      const hasMedicalInfo = !!(
        familyProfile?.medicalConditions &&
        Array.isArray(familyProfile.medicalConditions) &&
        familyProfile.medicalConditions.length > 0
      );
      items.push({
        label: "Medical Conditions",
        completed: hasMedicalInfo,
        description: "Add relevant medical conditions and health info",
        action: "Add medical conditions",
      });
      if (hasMedicalInfo) completedCount++;
      totalCount++;

      // 4. Location Preferences
      const hasLocation = !!(
        familyProfile?.location &&
        familyProfile?.city &&
        familyProfile?.state
      );
      items.push({
        label: "Location Preferences",
        completed: hasLocation,
        description: "Add preferred location for care",
        action: "Add location",
      });
      if (hasLocation) completedCount++;
      totalCount++;

      // 5. Budget Information
      const hasBudget = !!(familyProfile?.budgetMin && familyProfile?.budgetMax);
      items.push({
        label: "Budget Range",
        completed: hasBudget,
        description: "Set your budget expectations",
        action: "Add budget range",
      });
      if (hasBudget) completedCount++;
      totalCount++;

      // 6. Profile Photo
      const hasPhoto = !!(familyProfile?.profilePhoto);
      items.push({
        label: "Profile Photo",
        completed: hasPhoto,
        description: "Add a photo to personalize your profile",
        action: "Upload photo",
      });
      if (hasPhoto) completedCount++;
      totalCount++;
    } else {
      // Check provider profile completion
      const provider = await prisma.provider.findUnique({
        where: { userId: userId },
      });

      if (!provider) {
        return NextResponse.json({
          completionPercentage: 0,
          completedCount: 0,
          totalCount: 6,
          items: [],
        });
      }

      // 1. Basic Information
      const hasBasicInfo = !!(
        provider.name &&
        provider.description &&
        provider.address
      );
      items.push({
        label: "Basic Information",
        completed: hasBasicInfo,
        description: "Add your facility name, description, and address",
        action: "Complete basic info",
      });
      if (hasBasicInfo) completedCount++;
      totalCount++;

      // 2. Services & Amenities
      const hasServices = !!(
        provider.roomFeatures &&
        Array.isArray(provider.roomFeatures) &&
        provider.roomFeatures.length > 0
      );
      items.push({
        label: "Services & Amenities",
        completed: hasServices,
        description: "List the services and amenities you offer",
        action: "Add services",
      });
      if (hasServices) completedCount++;
      totalCount++;

      // 3. Photos & Virtual Tour
      const hasPhotos = !!(provider.photos && Array.isArray(provider.photos) && provider.photos.length >= 5);
      items.push({
        label: "Photos",
        completed: hasPhotos,
        description: "Upload at least 5 high-quality photos of your facility",
        action: "Upload photos",
      });
      if (hasPhotos) completedCount++;
      totalCount++;

      // 4. Licensing & Certifications
      const hasLicensing = !!(provider.licenseNumber);
      items.push({
        label: "Licensing",
        completed: hasLicensing,
        description: "Add your license number and certifications",
        action: "Add licensing info",
      });
      if (hasLicensing) completedCount++;
      totalCount++;

      // 5. Pricing Information
      const hasPricing = !!(provider.priceMin && provider.priceMax);
      items.push({
        label: "Pricing",
        completed: hasPricing,
        description: "Add transparent pricing information",
        action: "Add pricing",
      });
      if (hasPricing) completedCount++;
      totalCount++;

      // 6. Staff Information
      const hasStaffInfo = !!(provider.staffToResidentRatio);
      items.push({
        label: "Staff Information",
        completed: hasStaffInfo,
        description: "Add information about your team",
        action: "Add staff info",
      });
      if (hasStaffInfo) completedCount++;
      totalCount++;
    }

    const completionPercentage = Math.round((completedCount / totalCount) * 100);

    return NextResponse.json({
      completionPercentage,
      completedCount,
      totalCount,
      items,
      mode: activeMode,
    });
  } catch (error) {
    console.error("Failed to fetch profile completion:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile completion" },
      { status: 500 }
    );
  }
}
