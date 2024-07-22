/*
  Warnings:

  - You are about to drop the column `status` on the `UserBonus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Currency" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserBonus" DROP COLUMN "status",
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "BONUS_STATUS";
