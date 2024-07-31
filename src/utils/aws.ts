import aws from "aws-sdk";
import { config } from "../config/config";

export const s3 = new aws.S3({
  accessKeyId: config.AWS_S3_ACCESS_KEY,
  secretAccessKey: config.AWS_S3_SECRET_KEY,
});
