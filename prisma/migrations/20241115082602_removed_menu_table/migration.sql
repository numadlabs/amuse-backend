/*
  Warnings:

  - You are about to drop the column `menuId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Menu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Menu" DROP CONSTRAINT "Menu_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_menuId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "menuId";

-- DropTable
DROP TABLE "Menu";
