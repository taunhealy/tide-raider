-- AlterTable
ALTER TABLE "SurfCondition" ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'Western Cape';

-- CreateIndex
CREATE INDEX "SurfCondition_region_idx" ON "SurfCondition"("region");

-- CreateIndex
CREATE INDEX "SurfCondition_date_idx" ON "SurfCondition"("date");
