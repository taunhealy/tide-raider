/*
  Warnings:

  - The values [EXPERT] on the enum `SkillLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SkillLevel_new" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO');
ALTER TABLE "User" ALTER COLUMN "skillLevel" TYPE "SkillLevel_new" USING ("skillLevel"::text::"SkillLevel_new");
ALTER TABLE "SafariBooking" ALTER COLUMN "skillLevel" TYPE "SkillLevel_new" USING ("skillLevel"::text::"SkillLevel_new");
ALTER TYPE "SkillLevel" RENAME TO "SkillLevel_old";
ALTER TYPE "SkillLevel_new" RENAME TO "SkillLevel";
DROP TYPE "SkillLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;
