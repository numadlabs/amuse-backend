/*
  Warnings:

  - You are about to drop the column `currentPrice` on the `Currency` table. All the data in the column will be lost.
  - You are about to drop the column `setPrice` on the `Currency` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Currency" DROP COLUMN "currentPrice",
DROP COLUMN "setPrice",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserBonus" ADD COLUMN     "usedAt" TIMESTAMP(3);
