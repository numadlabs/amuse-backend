/*
  Warnings:

  - You are about to drop the column `changedBy` on the `AuditTrail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditTrail" DROP COLUMN "changedBy",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
