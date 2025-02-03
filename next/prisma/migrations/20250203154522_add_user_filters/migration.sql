-- CreateTable
CREATE TABLE "UserFilters" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserFilters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFilters_userEmail_key" ON "UserFilters"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "UserFilters_userId_key" ON "UserFilters"("userId");

-- CreateIndex
CREATE INDEX "UserFilters_userId_idx" ON "UserFilters"("userId");

-- AddForeignKey
ALTER TABLE "UserFilters" ADD CONSTRAINT "UserFilters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
