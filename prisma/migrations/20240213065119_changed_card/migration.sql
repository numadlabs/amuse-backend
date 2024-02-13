/*
  Warnings:

  - Made the column `createdAt` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "mintedAt" DROP NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "expiryInfo" DROP NOT NULL,
ALTER COLUMN "artistInfo" DROP NOT NULL,
ALTER COLUMN "nftImageUrl" DROP NOT NULL;
