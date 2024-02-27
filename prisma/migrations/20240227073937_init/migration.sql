-- CreateEnum
CREATE TYPE "ROLES" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "CATEGORY" AS ENUM ('JAPANESE', 'KOREAN', 'MEDITERRANEAN', 'BUFFET', 'FAST_FOOD', 'MONGOLIAN');

-- CreateEnum
CREATE TYPE "TIER" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "emailVerificationCode" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "ROLES" NOT NULL DEFAULT 'USER',
    "prefix" TEXT NOT NULL,
    "telNumber" TEXT NOT NULL,
    "telVerificationCode" TEXT,
    "isTelVerified" BOOLEAN NOT NULL DEFAULT false,
    "profilePicture" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" "CATEGORY" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "mintedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryInfo" TEXT,
    "artistInfo" TEXT,
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
    "mintedAt" TIMESTAMP(3),
    "ownedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isFirstTap" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tap" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,

    CONSTRAINT "Tap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bonus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "imageUrl" TEXT,
    "name" TEXT NOT NULL,
    "cardId" TEXT,

    CONSTRAINT "Bonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBonus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,
    "bonusId" TEXT NOT NULL,

    CONSTRAINT "UserBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
