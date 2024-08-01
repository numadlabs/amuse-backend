import { z } from "zod";
require("dotenv").config();

const envSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string(),
  PGHOST: z.string(),
  PGDATABASE: z.string(),
  PGUSER: z.string(),
  PGPASSWORD: z.string(),
  TWILLIO_ACCOUNT_SID: z.string(),
  TWILLIO_AUTH_TOKEN: z.string(),
  TWILLIO_PHONE_NUMBER: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_ACCESS_EXPIRATION_TIME: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRATION_TIME: z.string(),
  JWT_VERIFICATION_SECRET: z.string(),
  EMAIL_ADDRESS: z.string(),
  EMAIL_PASS: z.string(),
  AWS_S3_ACCESS_KEY: z.string(),
  AWS_S3_SECRET_KEY: z.string(),
  AWS_S3_BUCKET_NAME: z.string(),
  ENCRYPTION_ALGORITHM: z.string(),
  ENCRYPTION_SECRET: z.string(),
  ENCRYPTION_IV: z.string(),
  BITCOIN_API_URL: z.string(),
  BITCOIN_API_KEY: z.string(),
  CURRENCY_API_URL: z.string(),
  REDIS_CONNECTION_STRING: z.string(),
});

let env = envSchema.safeParse(process.env);
if (!env.success) {
  console.error(
    "Invalid environment variables:",
    env.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const config = env.data;