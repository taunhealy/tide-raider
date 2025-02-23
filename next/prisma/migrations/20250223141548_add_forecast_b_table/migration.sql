/*
  Warnings:

  - You are about to drop the `SurfCondition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SurfCondition";

-- CreateTable
CREATE TABLE "ForecastA" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "region" TEXT NOT NULL,
    "forecast" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForecastA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastB" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "region" TEXT NOT NULL,
    "forecast" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForecastB_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForecastA_date_region_key" ON "ForecastA"("date", "region");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastB_date_region_key" ON "ForecastB"("date", "region");
