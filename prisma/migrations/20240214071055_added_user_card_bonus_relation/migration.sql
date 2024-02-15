/*
  Warnings:

  - Added the required column `userCardId` to the `UserBonus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBonus" ADD COLUMN     "userCardId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserBonus" ADD CONSTRAINT "UserBonus_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "UserCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
