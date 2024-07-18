import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

const algorithm = process.env.ENCRYPTION_ALGORITHM;
const secretKey = process.env.ENCRYPTION_SECRET;
const iv = process.env.ENCRYPTION_IV;

export const encryptionHelper = {
  encrypt: async (data: string) => {
    const salt = await bcrypt.genSalt(10);
    const encryptedData = await bcrypt.hash(data, salt);

    return encryptedData;
  },
  compare: async (inputData: string, comparedData: string) => {
    const result = await bcrypt.compare(inputData, comparedData);

    return result;
  },
  encryptData: (data: string) => {
    if (!algorithm || !secretKey || !iv)
      throw new Error("No env provided to encryptData.");

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encryptedData = cipher.update(data, "utf-8", "hex");

    encryptedData += cipher.final("hex");

    return encryptedData;
  },
  decryptData: (encryptedData: string) => {
    if (!algorithm || !secretKey || !iv)
      throw new Error("No env provided to encryptData.");

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

    decryptedData += decipher.final("utf-8");

    return JSON.parse(decryptedData);
  },
};
