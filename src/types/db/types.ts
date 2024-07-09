import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { ROLES, CATEGORY, BONUS_TYPE, BONUS_STATUS, INVITE_STATUS } from "./enums";

export type Bonus = {
    id: Generated<string>;
    imageUrl: string | null;
    name: string;
    totalSupply: number;
    currentSupply: Generated<number>;
    price: number | null;
    visitNo: number | null;
    type: BONUS_TYPE;
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
export type Employee = {
    id: Generated<string>;
    password: string;
    firstname: string;
    lastname: string;
    role: ROLES;
    createdAt: Generated<Timestamp>;
    email: string;
    emailVerificationCode: string | null;
    restaurantId: string | null;
};
export type Invite = {
    id: Generated<string>;
    email: string;
    status: Generated<INVITE_STATUS>;
    emailVerificationCode: string | null;
    createdAt: Generated<Timestamp>;
    restaurantId: string;
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
    userId: string;
    userCardId: string;
};
export type Timetable = {
    id: Generated<string>;
    dayNoOfTheWeek: number;
    opensAt: string | null;
    closesAt: string | null;
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
};
export type UserBonus = {
    id: Generated<string>;
    status: Generated<BONUS_STATUS>;
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
    Employee: Employee;
    Invite: Invite;
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
