/*
  Warnings:

  - Made the column `balance` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `budget` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.
  - Made the column `givenOut` on table `Restaurant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "balance" SET NOT NULL,
ALTER COLUMN "budget" SET NOT NULL,
ALTER COLUMN "givenOut" SET NOT NULL;
