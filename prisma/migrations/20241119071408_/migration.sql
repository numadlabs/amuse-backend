/*
  Warnings:

  - The values [PENDING,COMPLETED,FAILED,REFUNDED,CANCELLED] on the enum `PAYMENT_STATUS` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `ebarimtReceiverType` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceNo]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invoiceNo` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PAYMENT_STATUS_new" AS ENUM ('REQUESTED', 'APPROVED', 'DECLINED');
ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PAYMENT_STATUS_new" USING ("status"::text::"PAYMENT_STATUS_new");
ALTER TYPE "PAYMENT_STATUS" RENAME TO "PAYMENT_STATUS_old";
ALTER TYPE "PAYMENT_STATUS_new" RENAME TO "PAYMENT_STATUS";
DROP TYPE "PAYMENT_STATUS_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amount",
DROP COLUMN "ebarimtReceiverType",
DROP COLUMN "metadata",
DROP COLUMN "method",
DROP COLUMN "refundedAt",
DROP COLUMN "transactionId",
DROP COLUMN "userId",
ADD COLUMN     "errorDesc" TEXT,
ADD COLUMN     "invoiceNo" TEXT NOT NULL,
ADD COLUMN     "provider" "PAYMENT_METHOD" NOT NULL DEFAULT 'QPAY',
ADD COLUMN     "providerInvoiceNo" TEXT,
ADD COLUMN     "rewardReceived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "invoiceNo" TEXT NOT NULL,
    "success" INTEGER,
    "errorCode" TEXT,
    "errorDesc" TEXT,
    "cardNumber" TEXT,
    "providerResponseCode" TEXT,
    "providerResponseDesc" TEXT,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNo_key" ON "Payment"("invoiceNo");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
