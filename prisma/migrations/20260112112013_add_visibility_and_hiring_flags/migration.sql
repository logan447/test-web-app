-- AlterTable
ALTER TABLE "FamilyProfile" ADD COLUMN     "visibleToProviders" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "hiringCaregivers" BOOLEAN NOT NULL DEFAULT false;
