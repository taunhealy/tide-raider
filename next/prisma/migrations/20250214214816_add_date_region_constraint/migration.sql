/*
  Warnings:

  - You are about to drop the column `timestamp` on the `SurfCondition` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,region]` on the table `SurfCondition` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SurfCondition" DROP COLUMN "timestamp";

-- CreateIndex
CREATE UNIQUE INDEX "SurfCondition_date_region_key" ON "SurfCondition"("date", "region");
