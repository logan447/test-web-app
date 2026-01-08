-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CONSULTATION', 'HIRING');

-- AlterTable
ALTER TABLE "ConsultRequest" ADD COLUMN "requestType" "RequestType" NOT NULL DEFAULT 'CONSULTATION';

-- CreateIndex
CREATE INDEX "ConsultRequest_requestType_idx" ON "ConsultRequest"("requestType");
