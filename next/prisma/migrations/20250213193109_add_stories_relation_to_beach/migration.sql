/*
  Warnings:

  - You are about to drop the column `country` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `waveType` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `continent` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the column `forecast` on the `Region` table. All the data in the column will be lost.
  - You are about to drop the `_BeachToRegion` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `regionId` on table `Beach` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_BeachToRegion" DROP CONSTRAINT "_BeachToRegion_A_fkey";

-- DropForeignKey
ALTER TABLE "_BeachToRegion" DROP CONSTRAINT "_BeachToRegion_B_fkey";

-- AlterTable
ALTER TABLE "Beach" DROP COLUMN "country",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "name",
DROP COLUMN "waveType",
ALTER COLUMN "regionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "Region" DROP COLUMN "continent",
DROP COLUMN "country",
DROP COLUMN "date",
DROP COLUMN "forecast";

-- DropTable
DROP TABLE "_BeachToRegion";

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beach" ADD CONSTRAINT "Beach_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
