import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { config } from "../config/config";

const algorithm = config.ENCRYPTION_ALGORITHM;
const secretKey = config.ENCRYPTION_SECRET;
const iv = config.ENCRYPTION_IV;

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

    try {
      const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

      let decryptedData = decipher.update(encryptedData, "hex", "utf-8");

      decryptedData += decipher.final("utf-8");
      const parsedData = JSON.parse(decryptedData);

      return parsedData;
    } catch (e) {
      return false;
    }
  },
};
