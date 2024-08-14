export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    RESTAURANT_OWNER: "RESTAURANT_OWNER",
    RESTAURANT_MANAGER: "RESTAURANT_MANAGER",
    RESTAURANT_WAITER: "RESTAURANT_WAITER",
    USER: "USER"
} as const;
export type ROLES = (typeof ROLES)[keyof typeof ROLES];
export const BONUS_TYPE = {
    SINGLE: "SINGLE",
    RECURRING: "RECURRING",
    REDEEMABLE: "REDEEMABLE"
} as const;
export type BONUS_TYPE = (typeof BONUS_TYPE)[keyof typeof BONUS_TYPE];
export const TRANSACTION_TYPE = {
    WITHDRAW: "WITHDRAW",
    DEPOSIT: "DEPOSIT",
    PURCHASE: "PURCHASE",
    REWARD: "REWARD"
} as const;
export type TRANSACTION_TYPE = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
export const NOTIFICATION_TYPE = {
    TAP: "TAP",
    BONUS: "BONUS",
    REWARD: "REWARD",
    CARD: "CARD"
} as const;
export type NOTIFICATION_TYPE = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
