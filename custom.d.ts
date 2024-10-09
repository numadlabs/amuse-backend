import { Request } from "express";
import { ROLES } from "./src/types/db/enums";

export interface AuthenticatedUser {
  id: string;
  role: ROLES;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}
