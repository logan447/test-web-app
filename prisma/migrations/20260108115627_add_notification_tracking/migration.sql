-- AddNotificationTracking
ALTER TABLE "ConsultRequest" ADD COLUMN "viewedByReceiver" BOOLEAN NOT NULL DEFAULT false;
