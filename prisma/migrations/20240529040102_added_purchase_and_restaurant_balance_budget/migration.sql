-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "balance" DOUBLE PRECISION,
ADD COLUMN     "budget" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userBonusId" TEXT NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userBonusId_fkey" FOREIGN KEY ("userBonusId") REFERENCES "UserBonus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
