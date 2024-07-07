import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { ROLES, CATEGORY } from "./enums";

export type Bonus = {
    id: Generated<string>;
    imageUrl: string | null;
    name: string;
    price: Generated<number>;
    totalSupply: number;
    currentSupply: number;
    cardId: string | null;
};
export type Card = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    nftImageUrl: string | null;
    instruction: string;
    benefits: string;
    restaurantId: string;
};
export type Currency = {
    id: Generated<string>;
    name: string;
    priceInUSD: number;
};
export type Device = {
    id: Generated<string>;
    pushToken: string;
    createdAt: Generated<Timestamp>;
};
export type Notification = {
    id: Generated<string>;
    message: string;
    isRead: boolean;
    userId: string;
};
export type Purchase = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    userBonusId: string;
};
export type Restaurant = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    name: string;
    category: CATEGORY;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    logo: string | null;
    balance: Generated<number>;
    rewardAmount: number;
    perkOccurence: number;
};
export type Tap = {
    id: Generated<string>;
    amount: number;
    tappedAt: Generated<Timestamp>;
    waiterId: string;
    userId: string;
    userCardId: string;
};
export type Timetable = {
    id: Generated<string>;
    dayNoOfTheWeek: number;
    opensAt: string;
    closesAt: string;
    isOffDay: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    restaurantId: string;
};
export type User = {
    id: Generated<string>;
    password: string;
    nickname: string;
    role: Generated<ROLES>;
    profilePicture: string | null;
    dateOfBirth: Timestamp | null;
    location: string | null;
    createdAt: Generated<Timestamp>;
    balance: Generated<number>;
    visitCount: Generated<number>;
    email: string | null;
    emailVerificationCode: string | null;
    isEmailVerified: Generated<boolean>;
    emailVerifiedAt: Timestamp | null;
    prefix: string;
    telNumber: string;
    telVerificationCode: string | null;
    isTelVerified: Generated<boolean>;
    telVerifiedAt: Timestamp | null;
    userTierId: string;
    restaurantId: string | null;
};
export type UserBonus = {
    id: Generated<string>;
    isUsed: Generated<boolean>;
    userId: string;
    userCardId: string;
    bonusId: string;
};
export type UserCard = {
    id: Generated<string>;
    visitCount: Generated<number>;
    ownedAt: Generated<Timestamp>;
    cardId: string;
    userId: string;
    isFirstTap: Generated<boolean>;
};
export type UserTier = {
    id: Generated<string>;
    name: string;
    requiredNo: number;
    rewardMultiplier: number;
    nextTierId: string | null;
};
export type DB = {
    Bonus: Bonus;
    Card: Card;
    Currency: Currency;
    Device: Device;
    Notification: Notification;
    Purchase: Purchase;
    Restaurant: Restaurant;
    Tap: Tap;
    Timetable: Timetable;
    User: User;
    UserBonus: UserBonus;
    UserCard: UserCard;
    UserTier: UserTier;
};
