import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { ROLES, CATEGORY, TIER } from "./enums";

export type Bonus = {
    id: Generated<string>;
    imageUrl: string;
    name: string;
    cardId: string;
};
export type Card = {
    id: Generated<string>;
    mintedAt: Timestamp | null;
    createdAt: Generated<Timestamp>;
    expiryInfo: string | null;
    artistInfo: string | null;
    nftImageUrl: string | null;
    instruction: string;
    benefits: string;
    restaurantId: string;
};
export type Notification = {
    id: Generated<string>;
    userId: string;
    message: string;
    type: string;
    isRead: boolean;
};
export type Restaurant = {
    id: Generated<string>;
    name: string;
    category: CATEGORY;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    opensAt: string;
    closesAt: string;
};
export type Tap = {
    id: Generated<string>;
    tappedAt: Timestamp;
    userId: string;
    userCardId: string;
};
export type User = {
    id: Generated<string>;
    email: string | null;
    emailVerificationCode: string | null;
    isEmailVerified: Generated<boolean>;
    emailVerifiedAt: Timestamp | null;
    password: string;
    nickname: string;
    firstName: string | null;
    lastName: string | null;
    role: Generated<ROLES>;
    prefix: string;
    telNumber: string;
    telVerificationCode: string | null;
    isTelVerified: Generated<boolean>;
    profilePicture: string | null;
    dateOfBirth: Timestamp | null;
    location: string | null;
    createdAt: Generated<Timestamp>;
};
export type UserBonus = {
    id: Generated<string>;
    userId: string;
    bonusId: string;
    isUsed: boolean;
};
export type UserCard = {
    id: Generated<string>;
    visitCount: number;
    mintedAt: Timestamp | null;
    ownedAt: Timestamp;
    cardId: string;
    userId: string;
};
export type DB = {
    Bonus: Bonus;
    Card: Card;
    Notification: Notification;
    Restaurant: Restaurant;
    Tap: Tap;
    User: User;
    UserBonus: UserBonus;
    UserCard: UserCard;
};
