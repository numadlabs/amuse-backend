import { NextFunction, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import { ZodError } from "zod";
import { MulterError } from "multer";
import logger from "../config/winston";
import { AuthenticatedRequest } from "../../custom";
import { config } from "../config/config";
import { DatabaseError } from "pg";

export function errorHandler(
  err: CustomError | ZodError | MulterError,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode,
    message = err.message;

  if (err instanceof CustomError) {
    statusCode = err.errorCode;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = `Invalid ${err.errors[0].path} input.`;
  } else if (err instanceof MulterError) {
    statusCode = 400;
  }

  let userId = "-";
  if (req.user?.id) userId = req.user.id;

  if (statusCode.toString().startsWith("4"))
    logger.notice({ message: message, userId: userId });
  if (statusCode.toString().startsWith("5"))
    logger.error({ message: message, userId: userId });

  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
    stack: config.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}
