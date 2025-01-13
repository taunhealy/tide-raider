-- DropIndex
DROP INDEX "SurfCondition_date_idx";

-- AlterTable
ALTER TABLE "Beach" ADD COLUMN     "advertisingPrice" DOUBLE PRECISION NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "SurfCondition" ALTER COLUMN "windSpeed" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "swellHeight" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "swellPeriod" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "timestamp" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "AdRequest" (
    "id" TEXT NOT NULL,
    "beachName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rejectionReason" TEXT,

    CONSTRAINT "AdRequest_pkey" PRIMARY KEY ("id")
);
