import { sendOTP } from "../lib/otpHelper";
import { userRepository } from "../repository/userRepository";

export const userServices = {
  setOTP: async (prefix: string, telNumber: string) => {
    const user = await userRepository.getUserByPhoneNumber(telNumber, prefix);

    if (!user) throw new Error("User does not exist!");

    const randomNumber =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    const isSent = await sendOTP(prefix, telNumber, randomNumber);

    if (!isSent) throw new Error("Error has occured while sending the OTP.");

    const updatedUser = await userRepository.setOTP(user.id, randomNumber);

    return updatedUser;
  },
  verifyOTP: async (id: string, verificationCode: number) => {
    const user = await userRepository.getUserById(id);

    if (!user) throw new Error("User does not exist!");

    if (
      user.telVerificationCode !== verificationCode ||
      user.telVerificationCode === null
    )
      throw new Error("Invalid verification code!");

    const updatedUser = await userRepository.setOTP(user.id, null, true);

    return updatedUser;
  },
};
