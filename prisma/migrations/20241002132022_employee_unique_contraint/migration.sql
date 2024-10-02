/*
  Warnings:

  - A unique constraint covering the columns `[email,isActive]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_isActive_key" ON "Employee"("email", "isActive");
