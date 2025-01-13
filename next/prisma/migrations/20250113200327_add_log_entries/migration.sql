-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "surferName" TEXT NOT NULL,
    "surferEmail" TEXT NOT NULL,
    "beachName" TEXT NOT NULL,
    "forecast" JSONB NOT NULL,
    "surferRating" INTEGER NOT NULL,
    "comments" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogEntry_surferEmail_idx" ON "LogEntry"("surferEmail");

-- CreateIndex
CREATE INDEX "LogEntry_date_idx" ON "LogEntry"("date");
