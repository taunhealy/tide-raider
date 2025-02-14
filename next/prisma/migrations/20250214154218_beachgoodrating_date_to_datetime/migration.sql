/*
  Warnings:

  - Changed the type of `date` on the `BeachGoodRating` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BeachGoodRating" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "BeachGoodRating_date_region_idx" ON "BeachGoodRating"("date", "region");

-- CreateIndex
CREATE INDEX "BeachGoodRating_beachId_date_idx" ON "BeachGoodRating"("beachId", "date");
