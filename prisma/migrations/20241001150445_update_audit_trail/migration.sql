/*
  Warnings:

  - Changed the type of `tableName` on the `AuditTrail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AUDIT_TRAIL_TABLES" AS ENUM ('RESTAURANT', 'CARD', 'BONUS', 'CATEGORY', 'TIMETABLE');

-- AlterTable
ALTER TABLE "AuditTrail" DROP COLUMN "tableName",
ADD COLUMN     "tableName" "AUDIT_TRAIL_TABLES" NOT NULL;
