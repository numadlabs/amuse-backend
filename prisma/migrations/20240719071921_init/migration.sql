-- CreateEnum
CREATE TYPE "ROLES" AS ENUM ('SUPER_ADMIN', 'RESTAURANT_OWNER', 'RESTAURANT_WAITER', 'USER');

-- CreateEnum
CREATE TYPE "BONUS_TYPE" AS ENUM ('SINGLE', 'RECURRING', 'REDEEMABLE');

-- CreateEnum
CREATE TYPE "BONUS_STATUS" AS ENUM ('UNUSED', 'USED', 'SERVED');

-- CreateEnum
CREATE TYPE "TRANSACTION_TYPE" AS ENUM ('WITHDRAW', 'DEPOSIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "role" "ROLES" NOT NULL DEFAULT 'USER',
    "profilePicture" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT,
    "emailVerificationCode" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "prefix" TEXT NOT NULL,
    "telNumber" TEXT NOT NULL,
    "telVerificationCode" TEXT,
    "telVerifiedAt" TIMESTAMP(3),
    "userTierId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "password" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "role" "ROLES" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "emailVerificationCode" TEXT,
    "restaurantId" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "prefix" TEXT NOT NULL,
    "telNumber" TEXT NOT NULL,
    "telVerificationCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTier" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "requiredNo" INTEGER NOT NULL,
    "rewardMultiplier" DOUBLE PRECISION NOT NULL,
    "nextTierId" TEXT,

    CONSTRAINT "UserTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "pushToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "logo" TEXT,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "perkOccurence" INTEGER NOT NULL DEFAULT 3,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timetable" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "dayNoOfTheWeek" INTEGER NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "isOffDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nftUrl" TEXT NOT NULL,
    "nftImageUrl" TEXT,
    "instruction" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "ownedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isFirstTap" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tap" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "amount" DOUBLE PRECISION NOT NULL,
    "tappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,

    CONSTRAINT "Tap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bonus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "totalSupply" INTEGER NOT NULL,
    "currentSupply" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION,
    "visitNo" INTEGER,
    "type" "BONUS_TYPE" NOT NULL,
    "cardId" TEXT,

    CONSTRAINT "Bonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBonus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "status" "BONUS_STATUS" NOT NULL DEFAULT 'UNUSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,
    "bonusId" TEXT NOT NULL,

    CONSTRAINT "UserBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ticker" TEXT NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "setPrice" DOUBLE PRECISION,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userBonusId" TEXT NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "txid" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TRANSACTION_TYPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "restaurantId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Device_pushToken_key" ON "Device"("pushToken");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userTierId_fkey" FOREIGN KEY ("userTierId") REFERENCES "UserTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTier" ADD CONSTRAINT "UserTier_nextTierId_fkey" FOREIGN KEY ("nextTierId") REFERENCES "UserTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tap" ADD CONSTRAINT "Tap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tap" ADD CONSTRAINT "Tap_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "UserCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBonus" ADD CONSTRAINT "UserBonus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBonus" ADD CONSTRAINT "UserBonus_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "UserCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBonus" ADD CONSTRAINT "UserBonus_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "Bonus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userBonusId_fkey" FOREIGN KEY ("userBonusId") REFERENCES "UserBonus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
