/*
  Warnings:

  - A unique constraint covering the columns `[beachId,date]` on the table `BeachGoodRating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BeachGoodRating_beachId_date_key" ON "BeachGoodRating"("beachId", "date");
