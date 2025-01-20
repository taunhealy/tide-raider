/*
  Warnings:

  - You are about to drop the column `beachName` on the `AdRequest` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `AdRequest` table. All the data in the column will be lost.
  - You are about to drop the column `isCustom` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `BnbListing` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `SurfSafariListing` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `SurfSafariListing` table. All the data in the column will be lost.
  - Added the required column `category` to the `AdRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `googleAdsContribution` to the `AdRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `AdRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearlyPrice` to the `AdRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `startDate` on the `AdRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endDate` on the `AdRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "BnbListing_region_idx";

-- DropIndex
DROP INDEX "SurfSafariListing_region_idx";

-- AlterTable
ALTER TABLE "AdRequest" DROP COLUMN "beachName",
DROP COLUMN "variantId",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "categoryData" JSONB,
ADD COLUMN     "googleAdsCampaignId" TEXT,
ADD COLUMN     "googleAdsContribution" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "yearlyPrice" DOUBLE PRECISION NOT NULL,
DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Beach" DROP COLUMN "isCustom",
DROP COLUMN "location",
DROP COLUMN "region";

-- AlterTable
ALTER TABLE "BnbListing" DROP COLUMN "region";

-- AlterTable
ALTER TABLE "SurfSafariListing" DROP COLUMN "location",
DROP COLUMN "region";

-- DropEnum
DROP TYPE "Location";

-- DropEnum
DROP TYPE "Region";

-- CreateIndex
CREATE INDEX "AdRequest_region_idx" ON "AdRequest"("region");

-- CreateIndex
CREATE INDEX "AdRequest_category_idx" ON "AdRequest"("category");

-- CreateIndex
CREATE INDEX "AdRequest_status_idx" ON "AdRequest"("status");
