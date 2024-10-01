-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "updatedEmployeeId" TEXT;

-- CreateTable
CREATE TABLE "AuditTrail" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tableName" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "changedBy" TEXT NOT NULL,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_updatedEmployeeId_fkey" FOREIGN KEY ("updatedEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
