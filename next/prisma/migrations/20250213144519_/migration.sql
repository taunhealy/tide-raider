/*
  Warnings:

  - You are about to drop the column `forecast` on the `LogEntry` table. All the data in the column will be lost.
  - Added the required column `country` to the `Beach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Beach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Beach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waveType` to the `Beach` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Beach_name_key";

-- DropIndex
DROP INDEX "LogEntry_date_idx";

-- DropIndex
DROP INDEX "LogEntry_surferEmail_idx";

-- AlterTable
ALTER TABLE "Beach" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "waveType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LogEntry" DROP COLUMN "forecast",
ADD COLUMN     "beachId" TEXT,
ADD COLUMN     "swellCardinalDirection" TEXT,
ADD COLUMN     "swellDirection" DOUBLE PRECISION,
ADD COLUMN     "swellHeight" DOUBLE PRECISION,
ADD COLUMN     "swellPeriod" DOUBLE PRECISION,
ADD COLUMN     "windDirection" DOUBLE PRECISION,
ADD COLUMN     "windSpeed" DOUBLE PRECISION,
ALTER COLUMN "surferName" DROP NOT NULL,
ALTER COLUMN "surferEmail" DROP NOT NULL,
ALTER COLUMN "beachName" DROP NOT NULL,
ALTER COLUMN "surferRating" DROP NOT NULL,
ALTER COLUMN "surferRating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "comments" DROP NOT NULL,
ALTER COLUMN "continent" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET DATA TYPE TEXT,
ALTER COLUMN "region" SET DATA TYPE TEXT,
ALTER COLUMN "waveType" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "forecast" JSONB NOT NULL,
    "continent" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BeachToRegion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BeachToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BeachToRegion_B_index" ON "_BeachToRegion"("B");

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_beachId_fkey" FOREIGN KEY ("beachId") REFERENCES "Beach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BeachToRegion" ADD CONSTRAINT "_BeachToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "Beach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BeachToRegion" ADD CONSTRAINT "_BeachToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
