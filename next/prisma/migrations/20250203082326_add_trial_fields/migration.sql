-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasActiveTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3);
