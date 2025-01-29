-- CreateTable
CREATE TABLE "BeachGoodRating" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "beachId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "conditions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeachGoodRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeachGoodRating_date_region_idx" ON "BeachGoodRating"("date", "region");

-- CreateIndex
CREATE INDEX "BeachGoodRating_beachId_date_idx" ON "BeachGoodRating"("beachId", "date");
