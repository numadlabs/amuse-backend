import { NextFunction, Request, Response } from "express";
import { CustomError } from "../exceptions/CustomError";

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode =
    err.errorCode === undefined
      ? res.statusCode !== 200
        ? res.statusCode
        : 500
      : err.errorCode;

  res.status(statusCode);
  res.json({
    success: false,
    data: null,
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}
