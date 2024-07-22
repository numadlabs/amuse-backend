/*
  Warnings:

  - You are about to drop the column `isFirstTap` on the `UserCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserCard" DROP COLUMN "isFirstTap",
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;
