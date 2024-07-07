import { sendOTP } from "../lib/otpHelper";
import { userRepository } from "../repository/userRepository";
import { sendVerificationEmail } from "../lib/emailHelper";
import { encryptionHelper } from "../lib/encryptionHelper";
import { extractVerification, generateVerificationToken } from "../utils/jwt";
import { CustomError } from "../exceptions/CustomError";
import { s3BucketName, verificationCodeConstants } from "../lib/constants";
import { s3 } from "../utils/aws";
import { randomUUID } from "crypto";
import { Insertable, Updateable } from "kysely";
import { User } from "../types/db/types";

const MAX = verificationCodeConstants.MAX_VALUE,
  MIN = verificationCodeConstants.MIN_VALUE;

export const userServices = {
  create: async (data: Insertable<User>) => {
    const hasUser = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );
    if (hasUser)
      throw new CustomError("User already exists with this phone number", 400);

    const hashedPassword = await encryptionHelper.encrypt(data.password);
    data.password = hashedPassword;

    const user = await userRepository.create(data);

    return user;
  },
  login: async (data: Insertable<User>) => {
    const user = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );

    if (!user) throw new CustomError("User not found", 400);

    const isUser = await encryptionHelper.compare(data.password, user.password);

    if (!isUser) throw new CustomError("Invalid login info.", 400);

    return user;
  },
  //user return hiihiin orond dugaariin avj boloh ym
  setOTP: async (data: Insertable<User>) => {
    const hasUser = await userRepository.getUserByPhoneNumber(
      data.telNumber,
      data.prefix
    );

    if (!hasUser) throw new CustomError("User does not exist!", 400);

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const telVerificationToken = generateVerificationToken(
      randomNumber,
      verificationCodeConstants.TEL_EXPIRATION_TIME
    );

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
      throw new CustomError("User does not exist!", 400);

    const telVerificationCode = extractVerification(
      hasUser.telVerificationCode
    );

    if (
      telVerificationCode !== verificationCode ||
      hasUser.telVerificationCode === null
    )
      throw new CustomError("Invalid verification code!", 400);

    hasUser.isTelVerified = true;
    hasUser.telVerificationCode = null;

    const user = await userRepository.update(hasUser.id, hasUser);

    return user;
  },
  checkOTP: async (id: string, verificationCode: number) => {
    const user = await userRepository.getUserById(id);

    if (!user || !user.telVerificationCode)
      throw new CustomError("User does not exist!", 400);

    const telVerificationCode = extractVerification(user.telVerificationCode);

    if (
      telVerificationCode !== verificationCode ||
      user.telVerificationCode === null
    )
      throw new CustomError("Invalid verification code!", 400);

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
      throw new CustomError("User does not exist or Has no email.", 400);

    if (userById.isEmailVerified)
      throw new CustomError("User's email is already verified.", 400);

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const emailVerificationToken = generateVerificationToken(
      randomNumber,
      verificationCodeConstants.EMAIL_EXPIRATION_TIME
    );

    await sendVerificationEmail(randomNumber, userById.email);

    userById.emailVerificationCode = emailVerificationToken;
    const user = await userRepository.update(userById.id, userById);

    return user;
  },
  verifyEmailVerification: async (id: string, verificationCode: number) => {
    const foundUser = await userRepository.getUserById(id);
    if (!foundUser || !foundUser.email)
      throw new CustomError("User does not exist or Has no email.", 400);

    if (!foundUser.emailVerificationCode || foundUser.isEmailVerified)
      throw new CustomError(
        "No verification code send/recorded or email is already verified.",
        400
      );

    const emailVerificationCode = extractVerification(
      foundUser.emailVerificationCode
    );

    if (emailVerificationCode !== verificationCode)
      throw new CustomError("Invalid verification code.", 400);

    foundUser.isEmailVerified = true;
    foundUser.emailVerifiedAt = new Date();
    foundUser.emailVerificationCode = null;

    const user = await userRepository.update(foundUser.id, foundUser);

    return user;
  },
  update: async (
    id: string,
    data: Updateable<User>,
    file: Express.Multer.File
  ) => {
    const findUser = await userRepository.getUserById(id);
    if (!findUser) throw new CustomError("User does not exist.", 400);

    if (file && findUser.profilePicture) {
      await s3
        .deleteObject({ Bucket: s3BucketName, Key: findUser.profilePicture })
        .promise();
    }

    if (file) {
      const s3Response = await s3
        .upload({
          Bucket: s3BucketName,
          Key: randomUUID(),
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      data.profilePicture = s3Response.Key;
    }

    const user = await userRepository.update(findUser.id, data);

    return user;
  },
  //add cascading effects
  delete: async (id: string) => {
    const findUser = await userRepository.getUserById(id);
    if (!findUser) throw new CustomError("User does not exist.", 400);

    if (findUser.profilePicture) {
      await s3
        .deleteObject({ Bucket: s3BucketName, Key: findUser.profilePicture })
        .promise();
    }

    const user = await userRepository.delete(findUser.id);

    return user;
  },
};
