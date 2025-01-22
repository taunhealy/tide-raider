-- AlterTable
ALTER TABLE "AdRequest" ADD COLUMN     "payfastSubscriptionId" TEXT,
ADD COLUMN     "variantId" TEXT;

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdRequest_payfastSubscriptionId_idx" ON "AdRequest"("payfastSubscriptionId");
