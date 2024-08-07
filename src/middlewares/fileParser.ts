import e, { NextFunction, Request, Response } from "express";
import multer from "multer";
import { fileSizeLimit } from "../lib/constants";

const storage = multer.memoryStorage();

const uploader = multer({
  storage: storage,
  limits: { fileSize: fileSizeLimit },
});

export function parseFile(fieldName: string) {
  return function uploadFile(req: Request, res: Response, next: NextFunction) {
    const upload = uploader.single(fieldName);

    upload(req, res, function (err: any) {
      if (err) {
        next(err);
      }
      next();
    });
  };
}
