/*
  Warnings:

  - You are about to drop the column `updatedEmployeeId` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `updatedEmployeeId` to the `AuditTrail` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `operation` on the `AuditTrail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AUDIT_TRAIL_OPERATIONS" AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_updatedEmployeeId_fkey";

-- AlterTable
ALTER TABLE "AuditTrail" ADD COLUMN     "updatedEmployeeId" TEXT NOT NULL,
DROP COLUMN "operation",
ADD COLUMN     "operation" "AUDIT_TRAIL_OPERATIONS" NOT NULL;

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "updatedEmployeeId";

-- AddForeignKey
ALTER TABLE "AuditTrail" ADD CONSTRAINT "AuditTrail_updatedEmployeeId_fkey" FOREIGN KEY ("updatedEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
