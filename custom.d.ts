import { Request } from "express";
import { ROLES } from "./src/types/db/enums";

interface AuthenticatedUser {
  id: string;
  role: ROLES;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
