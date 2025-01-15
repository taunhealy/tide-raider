/*
  Warnings:

  - You are about to drop the column `advertisingPrice` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `bestSeasons` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `crimeLevel` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `distanceFromCT` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `hasSharkAttack` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `hazards` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `optimalSwellCardinal` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `optimalSwellMax` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `optimalSwellMin` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `optimalTide` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `optimalWindDirections` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `sharkIncidents` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `swellPeriodMax` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `swellPeriodMin` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `swellSizeMax` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `swellSizeMin` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `videos` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `waterTempSummer` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `waterTempWinter` on the `Beach` table. All the data in the column will be lost.
  - You are about to drop the column `waveType` on the `Beach` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BeachBnbConnection" DROP CONSTRAINT "BeachBnbConnection_beachId_fkey";

-- DropForeignKey
ALTER TABLE "BeachSafariConnection" DROP CONSTRAINT "BeachSafariConnection_beachId_fkey";

-- DropIndex
DROP INDEX "Beach_difficulty_idx";

-- DropIndex
DROP INDEX "Beach_region_idx";

-- DropIndex
DROP INDEX "Beach_waveType_idx";

-- AlterTable
ALTER TABLE "Beach" DROP COLUMN "advertisingPrice",
DROP COLUMN "bestSeasons",
DROP COLUMN "coordinates",
DROP COLUMN "crimeLevel",
DROP COLUMN "description",
DROP COLUMN "difficulty",
DROP COLUMN "distanceFromCT",
DROP COLUMN "hasSharkAttack",
DROP COLUMN "hazards",
DROP COLUMN "image",
DROP COLUMN "optimalSwellCardinal",
DROP COLUMN "optimalSwellMax",
DROP COLUMN "optimalSwellMin",
DROP COLUMN "optimalTide",
DROP COLUMN "optimalWindDirections",
DROP COLUMN "profileImage",
DROP COLUMN "sharkIncidents",
DROP COLUMN "swellPeriodMax",
DROP COLUMN "swellPeriodMin",
DROP COLUMN "swellSizeMax",
DROP COLUMN "swellSizeMin",
DROP COLUMN "videos",
DROP COLUMN "waterTempSummer",
DROP COLUMN "waterTempWinter",
DROP COLUMN "waveType",
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "beachName" TEXT,
    "beachId" TEXT,
    "customBeach" TEXT,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Story_authorId_idx" ON "Story"("authorId");

-- CreateIndex
CREATE INDEX "Story_beachId_idx" ON "Story"("beachId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_beachId_fkey" FOREIGN KEY ("beachId") REFERENCES "Beach"("id") ON DELETE SET NULL ON UPDATE CASCADE;
