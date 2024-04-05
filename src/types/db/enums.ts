export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
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
export const TIER = {
    BRONZE: "BRONZE",
    SILVER: "SILVER",
    GOLD: "GOLD"
} as const;
export type TIER = (typeof TIER)[keyof typeof TIER];
