-- AlterTable
ALTER TABLE "AdRequest" ADD COLUMN     "lemonSubscriptionId" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lemonCustomerId" TEXT,
ADD COLUMN     "lemonSubscriptionId" TEXT;

-- AddForeignKey
ALTER TABLE "AdRequest" ADD CONSTRAINT "AdRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
