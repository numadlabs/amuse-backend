export const ROLES = {
    ADMIN: "ADMIN",
    USER: "USER"
} as const;
export type ROLES = (typeof ROLES)[keyof typeof ROLES];
