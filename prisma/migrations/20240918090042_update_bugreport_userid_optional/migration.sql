/*
  Warnings:

  - Made the column `userId` on table `BugReport` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BugReport" ALTER COLUMN "userId" SET NOT NULL;
