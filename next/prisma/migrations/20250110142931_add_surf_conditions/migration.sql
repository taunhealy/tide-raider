-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "SleepingType" AS ENUM ('COUCH', 'PRIVATE_ROOM', 'SHARED_ROOM', 'AIR_MATTRESS', 'MATTRESS', 'BUNK');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('WESTERN_CAPE', 'EASTERN_CAPE', 'KWAZULU_NATAL', 'GABON', 'NAMIBIA', 'ANGOLA');

-- CreateEnum
CREATE TYPE "Location" AS ENUM ('WEST_COAST', 'CAPE_PENINSULA', 'FALSE_BAY', 'OVERBERG', 'GARDEN_ROUTE', 'SWAKOPMUND', 'GABON_COAST', 'ROBERTSPORT', 'BENGUELA');

-- CreateEnum
CREATE TYPE "BoardType" AS ENUM ('SHORTBOARD', 'LONGBOARD', 'FISH', 'FUNBOARD', 'SUP', 'GUN', 'MINI_MAL');

-- CreateEnum
CREATE TYPE "FinType" AS ENUM ('THRUSTER', 'TWIN', 'QUAD', 'SINGLE', 'FIVE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "skillLevel" "SkillLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafariBooking" (
    "id" TEXT NOT NULL,
    "safariId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bringingBoard" BOOLEAN NOT NULL DEFAULT false,
    "requiresRental" BOOLEAN NOT NULL DEFAULT false,
    "skillLevel" "SkillLevel" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "boardId" TEXT,

    CONSTRAINT "SafariBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BnbBooking" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "boardId" TEXT,
    "rentBoardId" TEXT,
    "notes" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BnbBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BnbListing" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "location" TEXT NOT NULL,
    "profileImage" TEXT,
    "images" TEXT NOT NULL,
    "sleepingArrangement" "SleepingType" NOT NULL,
    "breakfastOptions" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "hasVehicleTransport" BOOLEAN NOT NULL DEFAULT false,
    "canTransportLongboard" BOOLEAN NOT NULL DEFAULT false,
    "canTransportShortboard" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BnbListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurfSafariListing" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "location" TEXT NOT NULL,
    "profileImage" TEXT,
    "price" DOUBLE PRECISION,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "hasVehicleTransport" BOOLEAN NOT NULL DEFAULT false,
    "canTransportLongboard" BOOLEAN NOT NULL DEFAULT false,
    "canTransportShortboard" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurfSafariListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeachSafariConnection" (
    "id" TEXT NOT NULL,
    "beachId" TEXT NOT NULL,
    "safariId" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,

    CONSTRAINT "BeachSafariConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeachBnbConnection" (
    "id" TEXT NOT NULL,
    "beachId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,

    CONSTRAINT "BeachBnbConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bnbListingId" TEXT,
    "safariId" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beach" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "location" TEXT NOT NULL,
    "distanceFromCT" DOUBLE PRECISION NOT NULL,
    "optimalWindDirections" JSONB NOT NULL,
    "optimalSwellMin" DOUBLE PRECISION NOT NULL,
    "optimalSwellMax" DOUBLE PRECISION NOT NULL,
    "optimalSwellCardinal" TEXT,
    "bestSeasons" JSONB NOT NULL,
    "optimalTide" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "waveType" TEXT NOT NULL,
    "swellSizeMin" DOUBLE PRECISION NOT NULL,
    "swellSizeMax" DOUBLE PRECISION NOT NULL,
    "swellPeriodMin" DOUBLE PRECISION NOT NULL,
    "swellPeriodMax" DOUBLE PRECISION NOT NULL,
    "waterTempSummer" DOUBLE PRECISION NOT NULL,
    "waterTempWinter" DOUBLE PRECISION NOT NULL,
    "hazards" JSONB NOT NULL,
    "crimeLevel" TEXT NOT NULL,
    "hasSharkAttack" BOOLEAN NOT NULL DEFAULT false,
    "sharkIncidents" JSONB,
    "image" TEXT,
    "coordinates" JSONB NOT NULL,
    "videos" JSONB,
    "profileImage" TEXT,

    CONSTRAINT "Beach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lemonSqueezyId" TEXT,
    "variantId" INTEGER,
    "checkoutUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BoardType" NOT NULL,
    "length" TEXT NOT NULL,
    "finSetup" "FinType" NOT NULL,
    "isForRent" BOOLEAN NOT NULL DEFAULT false,
    "rentPrice" DOUBLE PRECISION,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurfCondition" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "windDirection" TEXT NOT NULL,
    "windSpeed" INTEGER NOT NULL,
    "swellHeight" INTEGER NOT NULL,
    "swellDirection" TEXT NOT NULL,
    "swellPeriod" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurfCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_skillLevel_idx" ON "User"("skillLevel");

-- CreateIndex
CREATE INDEX "SafariBooking_safariId_idx" ON "SafariBooking"("safariId");

-- CreateIndex
CREATE INDEX "SafariBooking_userId_idx" ON "SafariBooking"("userId");

-- CreateIndex
CREATE INDEX "SafariBooking_date_idx" ON "SafariBooking"("date");

-- CreateIndex
CREATE INDEX "SafariBooking_status_idx" ON "SafariBooking"("status");

-- CreateIndex
CREATE INDEX "SafariBooking_boardId_idx" ON "SafariBooking"("boardId");

-- CreateIndex
CREATE INDEX "BnbBooking_listingId_idx" ON "BnbBooking"("listingId");

-- CreateIndex
CREATE INDEX "BnbBooking_userId_idx" ON "BnbBooking"("userId");

-- CreateIndex
CREATE INDEX "BnbBooking_status_idx" ON "BnbBooking"("status");

-- CreateIndex
CREATE INDEX "BnbListing_hostId_idx" ON "BnbListing"("hostId");

-- CreateIndex
CREATE INDEX "BnbListing_region_idx" ON "BnbListing"("region");

-- CreateIndex
CREATE INDEX "BnbListing_isActive_idx" ON "BnbListing"("isActive");

-- CreateIndex
CREATE INDEX "SurfSafariListing_guideId_idx" ON "SurfSafariListing"("guideId");

-- CreateIndex
CREATE INDEX "SurfSafariListing_region_idx" ON "SurfSafariListing"("region");

-- CreateIndex
CREATE INDEX "SurfSafariListing_isActive_idx" ON "SurfSafariListing"("isActive");

-- CreateIndex
CREATE INDEX "BeachSafariConnection_safariId_idx" ON "BeachSafariConnection"("safariId");

-- CreateIndex
CREATE INDEX "BeachSafariConnection_beachId_idx" ON "BeachSafariConnection"("beachId");

-- CreateIndex
CREATE UNIQUE INDEX "BeachSafariConnection_beachId_safariId_key" ON "BeachSafariConnection"("beachId", "safariId");

-- CreateIndex
CREATE INDEX "BeachBnbConnection_listingId_idx" ON "BeachBnbConnection"("listingId");

-- CreateIndex
CREATE INDEX "BeachBnbConnection_beachId_idx" ON "BeachBnbConnection"("beachId");

-- CreateIndex
CREATE UNIQUE INDEX "BeachBnbConnection_beachId_listingId_key" ON "BeachBnbConnection"("beachId", "listingId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Beach_name_key" ON "Beach"("name");

-- CreateIndex
CREATE INDEX "Beach_region_idx" ON "Beach"("region");

-- CreateIndex
CREATE INDEX "Beach_difficulty_idx" ON "Beach"("difficulty");

-- CreateIndex
CREATE INDEX "Beach_waveType_idx" ON "Beach"("waveType");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_key" ON "Membership"("userId");

-- CreateIndex
CREATE INDEX "Board_userId_idx" ON "Board"("userId");

-- CreateIndex
CREATE INDEX "Board_isForRent_idx" ON "Board"("isForRent");

-- CreateIndex
CREATE INDEX "SurfCondition_date_idx" ON "SurfCondition"("date");

-- AddForeignKey
ALTER TABLE "SafariBooking" ADD CONSTRAINT "SafariBooking_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafariBooking" ADD CONSTRAINT "SafariBooking_safariId_fkey" FOREIGN KEY ("safariId") REFERENCES "SurfSafariListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafariBooking" ADD CONSTRAINT "SafariBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BnbBooking" ADD CONSTRAINT "BnbBooking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BnbListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BnbBooking" ADD CONSTRAINT "BnbBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BnbBooking" ADD CONSTRAINT "BnbBooking_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BnbBooking" ADD CONSTRAINT "BnbBooking_rentBoardId_fkey" FOREIGN KEY ("rentBoardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BnbListing" ADD CONSTRAINT "BnbListing_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurfSafariListing" ADD CONSTRAINT "SurfSafariListing_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeachSafariConnection" ADD CONSTRAINT "BeachSafariConnection_beachId_fkey" FOREIGN KEY ("beachId") REFERENCES "Beach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeachSafariConnection" ADD CONSTRAINT "BeachSafariConnection_safariId_fkey" FOREIGN KEY ("safariId") REFERENCES "SurfSafariListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeachBnbConnection" ADD CONSTRAINT "BeachBnbConnection_beachId_fkey" FOREIGN KEY ("beachId") REFERENCES "Beach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeachBnbConnection" ADD CONSTRAINT "BeachBnbConnection_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "BnbListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bnbListingId_fkey" FOREIGN KEY ("bnbListingId") REFERENCES "BnbListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_safariId_fkey" FOREIGN KEY ("safariId") REFERENCES "SurfSafariListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
