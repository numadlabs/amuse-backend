/*
  Warnings:

  - Made the column `cardId` on table `Bonus` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Bonus" ALTER COLUMN "cardId" SET NOT NULL;
