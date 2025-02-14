/*
  Warnings:

  - You are about to drop the column `swellDirection` on the `SurfCondition` table. All the data in the column will be lost.
  - You are about to drop the column `swellHeight` on the `SurfCondition` table. All the data in the column will be lost.
  - You are about to drop the column `swellPeriod` on the `SurfCondition` table. All the data in the column will be lost.
  - You are about to drop the column `windDirection` on the `SurfCondition` table. All the data in the column will be lost.
  - You are about to drop the column `windSpeed` on the `SurfCondition` table. All the data in the column will be lost.
  - Added the required column `forecast` to the `SurfCondition` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `date` on the `SurfCondition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "SurfCondition_date_idx";

-- DropIndex
DROP INDEX "SurfCondition_region_idx";

-- AlterTable
ALTER TABLE "SurfCondition" DROP COLUMN "swellDirection",
DROP COLUMN "swellHeight",
DROP COLUMN "swellPeriod",
DROP COLUMN "windDirection",
DROP COLUMN "windSpeed",
ADD COLUMN     "forecast" JSONB NOT NULL,
DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "region" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "LogEntry_isPrivate_idx" ON "LogEntry"("isPrivate");

-- CreateIndex
CREATE INDEX "LogEntry_user_id_idx" ON "LogEntry"("user_id");

-- CreateIndex
CREATE INDEX "LogEntry_date_idx" ON "LogEntry"("date");

-- CreateIndex
CREATE INDEX "LogEntry_beachId_idx" ON "LogEntry"("beachId");

-- CreateIndex
CREATE INDEX "LogEntry_surferRating_idx" ON "LogEntry"("surferRating");
