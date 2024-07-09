export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    RESTAURANT_OWNER: "RESTAURANT_OWNER",
    RESTAURANT_WAITER: "RESTAURANT_WAITER",
    USER: "USER"
} as const;
export type ROLES = (typeof ROLES)[keyof typeof ROLES];
export const CATEGORY = {
    JAPANESE: "JAPANESE",
    KOREAN: "KOREAN",
    MEDITERRANEAN: "MEDITERRANEAN",
    BUFFET: "BUFFET",
    FAST_FOOD: "FAST_FOOD",
    MONGOLIAN: "MONGOLIAN",
    PAN_ASIAN: "PAN_ASIAN",
    CAFE: "CAFE",
    LEBANESE: "LEBANESE",
    BEACH_CLUB: "BEACH_CLUB",
    CHINESE: "CHINESE",
    GEORGIAN: "GEORGIAN",
    CUBAN: "CUBAN",
    MEXICAN: "MEXICAN"
} as const;
export type CATEGORY = (typeof CATEGORY)[keyof typeof CATEGORY];
export const BONUS_TYPE = {
    SINGLE: "SINGLE",
    RECURRING: "RECURRING",
    REDEEMABLE: "REDEEMABLE"
} as const;
export type BONUS_TYPE = (typeof BONUS_TYPE)[keyof typeof BONUS_TYPE];
export const BONUS_STATUS = {
    UNUSED: "UNUSED",
    USED: "USED",
    SERVED: "SERVED"
} as const;
export type BONUS_STATUS = (typeof BONUS_STATUS)[keyof typeof BONUS_STATUS];
export const INVITE_STATUS = {
    ON_HOLD: "ON_HOLD",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED"
} as const;
export type INVITE_STATUS = (typeof INVITE_STATUS)[keyof typeof INVITE_STATUS];
