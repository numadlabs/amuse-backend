/*
  Warnings:

  - A unique constraint covering the columns `[email,isActive,deletedAt]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Employee_email_isActive_key";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_isActive_deletedAt_key" ON "Employee"("email", "isActive", "deletedAt");
