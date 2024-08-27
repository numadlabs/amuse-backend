import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { ROLES, BONUS_TYPE, TRANSACTION_TYPE, NOTIFICATION_TYPE } from "./enums";

export type Bonus = {
    id: Generated<string>;
    name: string;
    totalSupply: number;
    currentSupply: Generated<number>;
    createdAt: Generated<Timestamp>;
    price: number | null;
    visitNo: number | null;
    type: BONUS_TYPE;
    cardId: string | null;
};
export type Card = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    nftUrl: string;
    nftImageUrl: string | null;
    instruction: string;
    benefits: string;
    restaurantId: string;
};
export type Category = {
    id: Generated<string>;
    name: string;
    createdAt: Generated<Timestamp>;
};
export type Currency = {
    id: Generated<string>;
    ticker: string;
    price: Generated<number>;
    updatedAt: Generated<Timestamp | null>;
};
export type Device = {
    id: Generated<string>;
    pushToken: string;
    createdAt: Generated<Timestamp>;
    userId: string | null;
};
export type EmailOtp = {
    id: Generated<string>;
    email: string;
    verificationCode: string;
    isUsed: Generated<boolean>;
    createdAt: Generated<Timestamp>;
};
export type Employee = {
    id: Generated<string>;
    passwordUpdateAt: Generated<Timestamp>;
    password: string;
    firstname: string;
    lastname: string;
    role: ROLES;
    createdAt: Generated<Timestamp>;
    email: string;
    restaurantId: string | null;
};
export type Notification = {
    id: Generated<string>;
    message: string;
    isRead: Generated<boolean>;
    type: Generated<NOTIFICATION_TYPE>;
    createdAt: Generated<Timestamp>;
    userId: string | null;
    employeeId: string | null;
};
export type Restaurant = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    name: string;
    description: string;
    location: string;
    googleMapsUrl: string | null;
    latitude: number;
    longitude: number;
    logo: string | null;
    balance: Generated<number>;
    rewardAmount: Generated<number>;
    perkOccurence: Generated<number>;
    categoryId: string;
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
export type Transaction = {
    id: Generated<string>;
    txid: string;
    amount: number;
    type: TRANSACTION_TYPE;
    createdAt: Generated<Timestamp>;
    restaurantId: string | null;
    userId: string | null;
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
    userTierId: string;
};
export type UserBonus = {
    id: Generated<string>;
    isUsed: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    usedAt: Timestamp | null;
    userId: string;
    userCardId: string;
    bonusId: string;
    waiterId: string | null;
};
export type UserCard = {
    id: Generated<string>;
    visitCount: Generated<number>;
    balance: Generated<number>;
    ownedAt: Generated<Timestamp>;
    cardId: string;
    userId: string;
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
    Category: Category;
    Currency: Currency;
    Device: Device;
    EmailOtp: EmailOtp;
    Employee: Employee;
    Notification: Notification;
    Restaurant: Restaurant;
    Tap: Tap;
    Timetable: Timetable;
    Transaction: Transaction;
    User: User;
    UserBonus: UserBonus;
    UserCard: UserCard;
    UserTier: UserTier;
};
