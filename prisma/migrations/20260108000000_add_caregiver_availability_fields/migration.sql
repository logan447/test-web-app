-- AlterTable
ALTER TABLE "Provider" ADD COLUMN "availableForFamilies" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "availableForOrganizations" BOOLEAN NOT NULL DEFAULT false;
