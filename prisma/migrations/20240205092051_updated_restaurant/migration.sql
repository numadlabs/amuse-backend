/*
  Warnings:

  - You are about to drop the column `about` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `benefits` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `instruction` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `benefits` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instruction` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `closesAt` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opensAt` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Restaurant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CATEGORY" AS ENUM ('JAPANESE', 'KOREAN', 'MEDITERRANEAN', 'BUFFET', 'FAST_FOOD', 'MONGOLIAN');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "benefits" TEXT NOT NULL,
ADD COLUMN     "instruction" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "about",
DROP COLUMN "benefits",
DROP COLUMN "instruction",
DROP COLUMN "walletAddress",
ADD COLUMN     "closesAt" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "opensAt" TEXT NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "CATEGORY" NOT NULL;
