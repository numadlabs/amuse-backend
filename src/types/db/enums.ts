export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    RESTAURANT_OWNER: "RESTAURANT_OWNER",
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
export const BONUS_STATUS = {
    UNUSED: "UNUSED",
    USED: "USED",
    SERVED: "SERVED"
} as const;
export type BONUS_STATUS = (typeof BONUS_STATUS)[keyof typeof BONUS_STATUS];
export const TRANSACTION_TYPE = {
    WITHDRAW: "WITHDRAW",
    DEPOSIT: "DEPOSIT"
} as const;
export type TRANSACTION_TYPE = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
