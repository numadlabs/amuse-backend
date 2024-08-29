import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import { ZodError } from "zod";
import { MulterError } from "multer";
import logger from "../config/winston";
import { AuthenticatedRequest } from "../../custom";

export function errorHandler(
  err: CustomError | ZodError | MulterError,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500,
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
    logger.warn({ message: message, userId: userId });
  if (statusCode.toString().startsWith("5"))
    logger.error({ message: message, userId: userId });

  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}
