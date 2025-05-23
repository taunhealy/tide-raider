-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_forecastId_fkey";

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_forecastId_fkey";

-- DropIndex
DROP INDEX "LogEntry_forecastId_idx";

-- AlterTable
ALTER TABLE "LogEntry" DROP COLUMN "forecastId",
ADD COLUMN     "forecast" JSONB;

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "forecastDate",
DROP COLUMN "forecastId";

