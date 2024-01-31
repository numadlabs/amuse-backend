import { Prisma } from "@prisma/client";
import { sendOTP } from "../lib/otpHelper";
import { comparePassword, encryptPassword } from "../lib/passwordHelper";
import { userRepository } from "../repository/userRepository";
import { sendVerificationEmail } from "../lib/emailHelper";

const MAX = 999999,
  MIN = 100000;

export const userServices = {
  create: async (data: Prisma.UserCreateInput) => {
    const hasUser = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );
    if (hasUser) throw new Error("User already exists with this phone number");

    const hashedPassword = await encryptPassword(data.password);
    data.password = hashedPassword;

    const user = await userRepository.create(data);

    user.password = "";
    user.emailVerificationCode = null;
    user.telVerificationCode = null;

    return user;
  },
  login: async (data: Prisma.UserCreateInput) => {
    const user = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );

    if (!user) throw new Error("User not found");

    const isUser = await comparePassword(data.password, user.password);

    if (!isUser) throw new Error("Invalid login info.");

    user.password = "";
    user.emailVerificationCode = null;
    user.telVerificationCode = null;

    return user;
  },
  setOTP: async (data: Prisma.UserCreateInput) => {
    const hasUser = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );

    if (!hasUser) throw new Error("User does not exist!");

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const isSent = await sendOTP(data.prefix, data.telNumber, randomNumber);

    if (!isSent) throw new Error("Error has occured while sending the OTP.");

    hasUser.telVerificationCode = randomNumber;
    const user = await userRepository.update(hasUser.id, hasUser);

    return user;
  },
  verifyOTP: async (
    id: string,
    verificationCode: number | null | undefined
  ) => {
    const hasUser = await userRepository.getUserById(id);

    if (!hasUser) throw new Error("User does not exist!");

    if (
      hasUser.telVerificationCode !== verificationCode ||
      hasUser.telVerificationCode === null
    )
      throw new Error("Invalid verification code!");

    hasUser.isTelVerified = true;
    hasUser.telVerificationCode = null;

    const user = await userRepository.update(hasUser.id, hasUser);

    return user;
  },
  //consider using hooks for when email is updated setting the isEmailVerified to false
  setEmailVerification: async (id: string) => {
    const userById = await userRepository.getUserById(id);

    if (!userById || !userById.email)
      throw new Error("User does not exist or Has no email.");

    if (userById.isEmailVerified)
      throw new Error("User's email is already verified.");

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    await sendVerificationEmail(randomNumber, userById.email);

    userById.emailVerificationCode = randomNumber;
    const user = await userRepository.update(userById.id, userById);

    return user;
  },
  verifyEmailVerification: async (id: string, verificationCode: number) => {
    const foundUser = await userRepository.getUserById(id);
    if (!foundUser || !foundUser.email)
      throw new Error("User does not exist or Has no email.");

    if (!foundUser.emailVerificationCode || foundUser.isEmailVerified)
      throw new Error(
        "No verification code send/recorded or email is already verified."
      );

    if (foundUser.emailVerificationCode !== verificationCode)
      throw new Error("Invalid verification code.");

    foundUser.isEmailVerified = true;
    foundUser.emailVerifiedAt = new Date();
    foundUser.emailVerificationCode = null;

    const user = await userRepository.update(foundUser.id, foundUser);

    return user;
  },
  update: async (id: string, data: Prisma.UserCreateInput) => {
    const findUser = await userRepository.getUserById(id);
    if (!findUser) throw new Error("User does not exist");

    const user = await userRepository.update(findUser.id, data);

    return user;
  },
  delete: async (id: string) => {
    const findUser = await userRepository.getUserById(id);
    if (!findUser) throw new Error("User does not exist");

    const user = await userRepository.delete(findUser.id);

    return user;
  },
};
