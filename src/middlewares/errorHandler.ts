import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";
import { ZodError } from "zod";
import { MulterError } from "multer";

export function errorHandler(
  err: CustomError | ZodError | MulterError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode,
    message = err.message;
  if (err instanceof CustomError) {
    statusCode =
      err.errorCode === undefined
        ? res.statusCode !== 200
          ? res.statusCode
          : 500
        : err.errorCode;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = `Invalid ${err.errors[0].path} input.`;
  } else if (err instanceof MulterError) {
    statusCode = 400;
  } else statusCode = res.statusCode;

  if (statusCode.toString().startsWith("5")) console.error(message);
  if (statusCode.toString().startsWith("4")) console.warn(message);

  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}
