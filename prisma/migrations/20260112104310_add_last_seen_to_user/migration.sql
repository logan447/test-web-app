-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- AlterTable
ALTER TABLE "ConsultRequest" ADD COLUMN     "contactReason" TEXT,
ADD COLUMN     "notificationSettings" JSONB,
ADD COLUMN     "preferredContactMethod" TEXT,
ADD COLUMN     "preferredTourDate" TIMESTAMP(3),
ADD COLUMN     "typingUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "typingUserId" TEXT;

-- AlterTable
ALTER TABLE "FamilyProfile" ADD COLUMN     "additionalContactNotes" TEXT,
ADD COLUMN     "additionalNeeds" TEXT,
ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "allowDirectMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bestTimeToContact" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "budgetFlexibility" TEXT,
ADD COLUMN     "budgetIncludes" TEXT,
ADD COLUMN     "careDuration" TEXT,
ADD COLUMN     "careLevel" TEXT,
ADD COLUMN     "careSettingPreference" TEXT,
ADD COLUMN     "careUrgency" TEXT,
ADD COLUMN     "communicationFrequency" TEXT,
ADD COLUMN     "communicationPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "culturalBackground" TEXT,
ADD COLUMN     "dailyLivingAssistance" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "financialAssistanceNeeded" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "hideFromSearch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hobbiesInterests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "languagePreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "livingSituation" TEXT,
ADD COLUMN     "lovedOneName" TEXT,
ADD COLUMN     "medicalConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mobilityStatus" TEXT,
ADD COLUMN     "neighborhoodPreferences" TEXT,
ADD COLUMN     "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "personalityTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "petPreferences" TEXT,
ADD COLUMN     "preferredContactMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preferredStartDate" TEXT,
ADD COLUMN     "profileNotes" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "profileVisibility" TEXT DEFAULT 'limited',
ADD COLUMN     "proximityDetails" TEXT,
ADD COLUMN     "proximityImportance" TEXT,
ADD COLUMN     "relationship" TEXT,
ADD COLUMN     "religiousPreferences" TEXT,
ADD COLUMN     "scheduleFlexibility" TEXT,
ADD COLUMN     "shareWithVerifiedOnly" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showContactInfo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showFullName" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tourPreference" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SENT';

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "acceptsFinancialAssistance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accreditations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "activitiesOffered" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "additionalServicesJson" TEXT,
ADD COLUMN     "allStaffBackgroundChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "applicationFee" INTEGER,
ADD COLUMN     "availableSpots" INTEGER,
ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "awardsJson" TEXT,
ADD COLUMN     "backgroundChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brochureUrl" TEXT,
ADD COLUMN     "caregiverTraining" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "certificateUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "commonAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "communityFee" INTEGER,
ADD COLUMN     "coverPhoto" TEXT,
ADD COLUMN     "daytimeStaffRatio" TEXT,
ADD COLUMN     "detailedDailyLivingServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "detailedMedicalServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "detailedMemoryCareServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "detailedPersonalCareServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "detailedSocialRecServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dietaryOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "establishedYear" TEXT,
ADD COLUMN     "eveningStaffRatio" TEXT,
ADD COLUMN     "facilityHistory" TEXT,
ADD COLUMN     "financialAssistanceTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "floorPlanUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hasHospiceCare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasLVNOnSite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasMemoryCare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasOnCallPhysician" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPharmacyPartnership" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasRNOnSite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasRespiteCare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasTrialPeriod" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "includedServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "insuranceVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "medicalAmenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "medicalServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "missionStatement" TEXT,
ADD COLUMN     "nearbyAmenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "neighborhoodDescription" TEXT,
ADD COLUMN     "nightStaffRatio" TEXT,
ADD COLUMN     "offersPaymentPlans" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentOptions" TEXT[],
ADD COLUMN     "paymentPlanDetails" TEXT,
ADD COLUMN     "petPolicy" TEXT,
ADD COLUMN     "petPolicyDetails" TEXT,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "priceDescription" TEXT,
ADD COLUMN     "priceMax" INTEGER,
ADD COLUMN     "priceMin" INTEGER,
ADD COLUMN     "privateRoomMax" INTEGER,
ADD COLUMN     "privateRoomMin" INTEGER,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "roomFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "safetySecurityFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "securityDeposit" INTEGER,
ADD COLUMN     "semiPrivateRoomMax" INTEGER,
ADD COLUMN     "semiPrivateRoomMin" INTEGER,
ADD COLUMN     "smokingPolicy" TEXT,
ADD COLUMN     "specialtyPrograms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialtyProgramsJson" TEXT,
ADD COLUMN     "staffCredentials" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "staffToResidentRatio" TEXT,
ADD COLUMN     "staffTrainingDescription" TEXT,
ADD COLUMN     "teamMembersJson" TEXT,
ADD COLUMN     "totalCapacity" INTEGER,
ADD COLUMN     "trialPeriodDuration" TEXT,
ADD COLUMN     "virtualTourType" TEXT,
ADD COLUMN     "virtualTourUrl" TEXT,
ADD COLUMN     "visitingDoctorFrequency" TEXT,
ADD COLUMN     "visitorPolicy" TEXT,
ADD COLUMN     "waitlistAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatMakesUsUnique" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeen" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SavedFamilyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedFamilyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourAppointment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "proposedBy" TEXT NOT NULL,
    "proposedDate" TIMESTAMP(3) NOT NULL,
    "proposedTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourAppointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "contactViewsUsed" INTEGER NOT NULL DEFAULT 0,
    "contactViewsLimit" INTEGER,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "relationship" TEXT,
    "lengthOfStay" TEXT,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedFamilyProfile_userId_idx" ON "SavedFamilyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedFamilyProfile_userId_familyProfileId_key" ON "SavedFamilyProfile"("userId", "familyProfileId");

-- CreateIndex
CREATE INDEX "TourAppointment_requestId_idx" ON "TourAppointment"("requestId");

-- CreateIndex
CREATE INDEX "TourAppointment_status_idx" ON "TourAppointment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "ContactView_userId_idx" ON "ContactView"("userId");

-- CreateIndex
CREATE INDEX "ContactView_familyProfileId_idx" ON "ContactView"("familyProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactView_userId_familyProfileId_key" ON "ContactView"("userId", "familyProfileId");

-- CreateIndex
CREATE INDEX "Review_providerId_idx" ON "Review"("providerId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_providerId_userId_key" ON "Review"("providerId", "userId");

-- AddForeignKey
ALTER TABLE "SavedFamilyProfile" ADD CONSTRAINT "SavedFamilyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedFamilyProfile" ADD CONSTRAINT "SavedFamilyProfile_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourAppointment" ADD CONSTRAINT "TourAppointment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ConsultRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactView" ADD CONSTRAINT "ContactView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactView" ADD CONSTRAINT "ContactView_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
