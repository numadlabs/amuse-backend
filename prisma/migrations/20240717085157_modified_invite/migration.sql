/*
  Warnings:

  - You are about to drop the column `isTelVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_restaurantId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTelVerified";

-- DropTable
DROP TABLE "Invite";

-- CreateTable
CREATE TABLE "TempUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "prefix" TEXT NOT NULL,
    "telNumber" TEXT NOT NULL,
    "telVerificationCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempUser_pkey" PRIMARY KEY ("id")
);
