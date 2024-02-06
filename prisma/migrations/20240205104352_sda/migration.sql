-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_membershipCardId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "membershipCardId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_membershipCardId_fkey" FOREIGN KEY ("membershipCardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
