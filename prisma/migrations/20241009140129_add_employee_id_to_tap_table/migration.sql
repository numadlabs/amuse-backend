-- AlterTable
ALTER TABLE "Tap" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "Tap" ADD CONSTRAINT "Tap_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
