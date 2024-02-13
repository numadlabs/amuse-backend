/*
  Warnings:

  - You are about to drop the column `membershipCardId` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `cardId` to the `Bonus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_membershipCardId_fkey";

-- DropIndex
DROP INDEX "Restaurant_membershipCardId_key";

-- AlterTable
ALTER TABLE "Bonus" ADD COLUMN     "cardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "restaurantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "membershipCardId";

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
