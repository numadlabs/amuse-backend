import { Prisma } from "@prisma/client";
import { sendOTP } from "../lib/otpHelper";
import { userRepository } from "../repository/userRepository";
import { sendVerificationEmail } from "../lib/emailHelper";
import { encryptionHelper } from "../lib/encryptionHelper";
import { extractVerification, generateVerificationToken } from "../utils/jwt";
import jwt from "jsonwebtoken";

const MAX = 9999,
  MIN = 1000;

export const userServices = {
  create: async (data: Prisma.UserCreateInput) => {
    const hasUser = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );
    if (hasUser) throw new Error("User already exists with this phone number");

    const hashedPassword = await encryptionHelper.encrypt(data.password);
    data.password = hashedPassword;

    const user = await userRepository.create(data);

    return user;
  },
  login: async (data: Prisma.UserCreateInput) => {
    const user = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );

    if (!user) throw new Error("User not found");

    const isUser = await encryptionHelper.compare(data.password, user.password);

    if (!isUser) throw new Error("Invalid login info.");

    return user;
  },
  //user return hiihiin orond dugaariin avj boloh ym
  setOTP: async (data: Prisma.UserCreateInput) => {
    const hasUser = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );

    if (!hasUser) throw new Error("User does not exist!");

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const telVerificationToken = generateVerificationToken(randomNumber, "5m");
    //const encryptedToken = await encryptionHelper.encrypt(telVerificationToken);

    const isSent = await sendOTP(data.prefix, data.telNumber, randomNumber);
    if (!isSent) throw new Error("Error has occured while sending the OTP.");

    hasUser.telVerificationCode = telVerificationToken;
    const user = await userRepository.update(hasUser.id, hasUser);

    return user;
  },
  verifyOTP: async (
    id: string,
    verificationCode: number | null | undefined
  ) => {
    const hasUser = await userRepository.getUserById(id);

    if (!hasUser || !hasUser.telVerificationCode)
      throw new Error("User does not exist!");

    const telVerificationCode = extractVerification(
      hasUser.telVerificationCode
    );

    if (
      telVerificationCode !== verificationCode ||
      hasUser.telVerificationCode === null
    )
      throw new Error("Invalid verification code!");

    hasUser.isTelVerified = true;
    hasUser.telVerificationCode = null;

    const user = await userRepository.update(hasUser.id, hasUser);

    return user;
  },
  checkOTP: async (id: string, verificationCode: number) => {
    const user = await userRepository.getUserById(id);

    if (!user || !user.telVerificationCode)
      throw new Error("User does not exist!");

    const telVerificationCode = extractVerification(user.telVerificationCode);

    if (
      telVerificationCode !== verificationCode ||
      user.telVerificationCode === null
    )
      throw new Error("Invalid verification code!");

    return user;
  },
  changePassword: async (
    id: string,
    verificationCode: number,
    password: string
  ) => {
    const user = await userServices.checkOTP(id, verificationCode);

    const encryptedPassword = await encryptionHelper.encrypt(password);

    user.password = encryptedPassword;
    user.telVerificationCode = null;
    const updatedUser = await userRepository.update(id, user);

    return updatedUser;
  },
  //consider using hooks for when email is updated setting the isEmailVerified to false
  setEmailVerification: async (id: string) => {
    const userById = await userRepository.getUserById(id);

    if (!userById || !userById.email)
      throw new Error("User does not exist or Has no email.");

    if (userById.isEmailVerified)
      throw new Error("User's email is already verified.");

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const emailVerificationToken = generateVerificationToken(
      randomNumber,
      "1m"
    );
    console.log("Email verification token: ", emailVerificationToken);
    //const encryptedToken = await encryptionHelper.encrypt(emailVerificationToken);

    await sendVerificationEmail(randomNumber, userById.email);

    userById.emailVerificationCode = emailVerificationToken;
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

    const emailVerificationCode = extractVerification(
      foundUser.emailVerificationCode
    );
    console.log(
      "Email verification token from DB: ",
      foundUser.emailVerificationCode
    );
    console.log("Extracted email verification token: ", emailVerificationCode);

    if (emailVerificationCode !== verificationCode)
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
  //add cascading effects
  delete: async (id: string) => {
    const findUser = await userRepository.getUserById(id);
    if (!findUser) throw new Error("User does not exist");

    const user = await userRepository.delete(findUser.id);

    return user;
  },
};
