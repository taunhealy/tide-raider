/*
  Warnings:

  - You are about to drop the column `swellCardinalDirection` on the `LogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `swellDirection` on the `LogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `swellHeight` on the `LogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `swellPeriod` on the `LogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `windDirection` on the `LogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `windSpeed` on the `LogEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LogEntry" DROP COLUMN "swellCardinalDirection",
DROP COLUMN "swellDirection",
DROP COLUMN "swellHeight",
DROP COLUMN "swellPeriod",
DROP COLUMN "windDirection",
DROP COLUMN "windSpeed",
ADD COLUMN     "forecast" JSONB;
