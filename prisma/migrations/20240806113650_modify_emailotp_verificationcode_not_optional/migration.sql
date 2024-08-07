/*
  Warnings:

  - Made the column `verificationCode` on table `EmailOtp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EmailOtp" ALTER COLUMN "verificationCode" SET NOT NULL;
