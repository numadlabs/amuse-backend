import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { ROLES } from "./enums";

export type User = {
    id: Generated<string>;
    email: string | null;
    emailVerificationCode: number | null;
    isEmailVerified: Generated<boolean>;
    emailVerifiedAt: Timestamp | null;
    password: string;
    nickname: string;
    firstName: string | null;
    lastName: string | null;
    role: Generated<ROLES>;
    prefix: string;
    telNumber: string;
    telVerificationCode: number | null;
    isTelVerified: Generated<boolean>;
    profilePicture: string | null;
    dateOfBirth: Timestamp | null;
    location: string | null;
    createdAt: Generated<Timestamp>;
};
export type DB = {
    User: User;
};
