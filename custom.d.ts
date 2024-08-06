import { Prisma } from "@prisma/client";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: Prisma.UserCreateInput;
}
