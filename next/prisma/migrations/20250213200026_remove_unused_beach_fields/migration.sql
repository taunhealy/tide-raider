/*
  Warnings:

  - Added the required column `name` to the `Beach` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Beach" ADD COLUMN     "name" TEXT NOT NULL;
