/*
  Warnings:

  - You are about to drop the column `newData` on the `AuditTrail` table. All the data in the column will be lost.
  - You are about to drop the column `oldData` on the `AuditTrail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditTrail" DROP COLUMN "newData",
DROP COLUMN "oldData",
ADD COLUMN     "data" JSONB;
