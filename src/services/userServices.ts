import { sendOTP } from "../lib/otpHelper";
import { comparePassword, encryptPassword } from "../lib/passwordHelper";
import { userRepository } from "../repository/userRepository";

export const userServices = {
  create: async (
    prefix: string,
    telNumber: string,
    nickname: string,
    password: string
  ) => {
    const user = await userRepository.getUserByPhoneNumber(telNumber, prefix);
    if (user) throw new Error("User already exists with this phone number");

    const hashedPassword = await encryptPassword(password);

    const createdUser = await userRepository.create(
      nickname,
      prefix,
      telNumber,
      hashedPassword.toString()
    );

    if (!createdUser) {
      throw new Error("Could not add user");
    }

    createdUser.password = "";
    createdUser.emailVerificationCode = null;
    createdUser.telVerificationCode = null;

    return createdUser;
  },
  login: async (prefix: string, telNumber: string, password: string) => {
    const user = await userRepository.getUserByPhoneNumber(telNumber, prefix);

    if (!user) throw new Error("User not found");

    const isUser = await comparePassword(password, user.password);

    if (!isUser) throw new Error("Invalid login info.");

    user.password = "";
    user.emailVerificationCode = null;
    user.telVerificationCode = null;

    return user;
  },
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
