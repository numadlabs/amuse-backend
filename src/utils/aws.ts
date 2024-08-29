import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import { config } from "../config/config";

export const s3 = new S3({
  credentials: {
    accessKeyId: config.AWS_S3_ACCESS_KEY,
    secretAccessKey: config.AWS_S3_SECRET_KEY,
  },
  region: "eu-central-1",
});

export async function uploadToS3(key: string, file: Express.Multer.File) {
  const s3Response = await new Upload({
    client: s3,
    params: {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  }).done();

  return s3Response;
}

export async function deleteFromS3(key: string) {
  await s3.deleteObject({
    Bucket: config.AWS_S3_BUCKET_NAME,
    Key: key,
  });
}
