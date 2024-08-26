import aws from "aws-sdk";
import { config } from "../config/config";

export const s3 = new aws.S3({
  accessKeyId: config.AWS_S3_ACCESS_KEY,
  secretAccessKey: config.AWS_S3_SECRET_KEY,
});

export async function uploadToS3(key: string, file: Express.Multer.File) {
  const s3Response = await s3
    .upload({
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();

  return s3Response;
}

export async function deleteFromS3(key: string) {
  await s3
    .deleteObject({
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: key,
    })
    .promise();
}
