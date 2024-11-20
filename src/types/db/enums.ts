export const ORDER_STATUS = {
    PENDING: "PENDING",
    SERVED: "SERVED",
    CANCELLED: "CANCELLED"
} as const;
export type ORDER_STATUS = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export const PAYMENT_STATUS = {
    REQUESTED: "REQUESTED",
    APPROVED: "APPROVED",
    DECLINED: "DECLINED"
} as const;
export type PAYMENT_STATUS = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export const PAYMENT_METHOD = {
    QPAY: "QPAY",
    CARD: "CARD",
    METAMASK: "METAMASK"
} as const;
export type PAYMENT_METHOD = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export const EBARIMT_RECEIVER_TYPE = {
    CITIZEN: "CITIZEN",
    ORGINIZATION: "ORGINIZATION"
} as const;
export type EBARIMT_RECEIVER_TYPE = (typeof EBARIMT_RECEIVER_TYPE)[keyof typeof EBARIMT_RECEIVER_TYPE];
export const PRODUCT_STATUS = {
    SOLD_OUT: "SOLD_OUT",
    AVAILABLE: "AVAILABLE",
    INCOMING: "INCOMING"
} as const;
export type PRODUCT_STATUS = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];
export const PRODUCT_SIZE = {
    SMALL: "SMALL",
    MEDIUM: "MEDIUM",
    LARGE: "LARGE"
} as const;
export type PRODUCT_SIZE = (typeof PRODUCT_SIZE)[keyof typeof PRODUCT_SIZE];
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
export const AUDIT_TRAIL_TABLES = {
    RESTAURANT: "RESTAURANT",
    CARD: "CARD",
    BONUS: "BONUS",
    CATEGORY: "CATEGORY",
    TIMETABLE: "TIMETABLE",
    EMPLOYEE: "EMPLOYEE"
} as const;
export type AUDIT_TRAIL_TABLES = (typeof AUDIT_TRAIL_TABLES)[keyof typeof AUDIT_TRAIL_TABLES];
export const AUDIT_TRAIL_OPERATIONS = {
    INSERT: "INSERT",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
    PUSH_NOTIFICATION: "PUSH_NOTIFICATION"
} as const;
export type AUDIT_TRAIL_OPERATIONS = (typeof AUDIT_TRAIL_OPERATIONS)[keyof typeof AUDIT_TRAIL_OPERATIONS];
