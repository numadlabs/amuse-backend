import * as bcrypt from "bcrypt";

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
};
