import { userRepository } from "../repository/userRepository";
import { sendEmail } from "../lib/emailHelper";
import { encryptionHelper } from "../lib/encryptionHelper";
import {
  extractVerification,
  generateTokens,
  generateVerificationToken,
} from "../utils/jwt";
import { CustomError } from "../exceptions/CustomError";
import { verificationCodeConstants } from "../lib/constants";
import { s3 } from "../utils/aws";
import { randomUUID } from "crypto";
import { Insertable, Updateable } from "kysely";
import { EmailOtp, User } from "../types/db/types";
import { userTierRepository } from "../repository/userTierRepository";
import { emailOtpRepository } from "../repository/emailOtpRepository";
import { config } from "../config/config";
import { hideSensitiveData } from "../lib/hideDataHelper";

const MAX = verificationCodeConstants.MAX_VALUE,
  MIN = verificationCodeConstants.MIN_VALUE;
const s3BucketName = config.AWS_S3_BUCKET_NAME;

export const userServices = {
  create: async (
    email: string,
    password: string,
    nickname: string,
    verificationCode: number
  ) => {
    const hasUser = await userRepository.getByEmail(email);
    if (hasUser)
      throw new CustomError("User already exists with this email.", 400);

    const emailOtp = await emailOtpRepository.getByEmail(email);
    // if (!emailOtp || !emailOtp.verificationCode)
    //   throw new CustomError(
    //     "Please send OTP first and then provide the verificationCode.",
    //     400
    //   );

    // if (emailOtp.isUsed)
    //   throw new CustomError("OTP has already been used.", 400);

    // const emailVerificationCode = extractVerification(
    //   emailOtp.verificationCode
    // );

    // if (emailVerificationCode !== verificationCode)
    //   throw new CustomError("Invalid verification code!", 400);

    const hashedPassword = await encryptionHelper.encrypt(password);
    const userTier = await userTierRepository.getStartingTier();

    const user = await userRepository.create({
      email: email,
      password: hashedPassword,
      nickname,
      userTierId: userTier.id,
    });

    // emailOtp.isUsed = true;
    // await emailOtpRepository.update(emailOtp.id, emailOtp);

    const { accessToken, refreshToken } = generateTokens(user);

    const sanitizedUser = hideSensitiveData(user, ["password"]);

    return { user: sanitizedUser, accessToken, refreshToken };
  },
  login: async (email: string, password: string) => {
    const user = await userRepository.getByEmail(email);
    if (!user) throw new CustomError("User not found.", 400);

    const isUser = await encryptionHelper.compare(password, user.password);
    if (!isUser) throw new CustomError("Invalid login info.", 400);

    const { accessToken, refreshToken } = generateTokens(user);

    const sanitizedUser = hideSensitiveData(user, ["password"]);

    return { user: sanitizedUser, accessToken, refreshToken };
  },
  sendOTP: async (email: string) => {
    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const emailVerificationCode = generateVerificationToken(
      randomNumber,
      verificationCodeConstants.EMAIL_EXPIRATION_TIME
    );

    const isSent = await sendEmail(
      "Amuse Bouche OTP",
      `Your Amuse Bouche verification code is: ${randomNumber}`,
      email
    );
    if (!isSent.accepted)
      throw new Error("Error has occured while sending the OTP.");

    const emailOtp = await emailOtpRepository.create({
      email: email.toLowerCase(),
      verificationCode: emailVerificationCode,
    });

    return emailOtp;
  },
  checkOTP: async (email: string, verificationCode: number) => {
    const emailOtp = await emailOtpRepository.getByEmail(email.toLowerCase());

    if (!emailOtp || !emailOtp.verificationCode)
      throw new CustomError("No recorded of OTP found!", 400);

    if (emailOtp.isUsed)
      throw new CustomError("OTP has already been used.", 400);

    const emailVerificationCode = extractVerification(
      emailOtp.verificationCode
    );

    if (
      emailVerificationCode !== verificationCode ||
      emailOtp.verificationCode === null
    )
      throw new CustomError("Invalid verification code!", 400);

    return emailOtp;
  },
  forgotPassword: async (
    email: string,
    verificationCode: number,
    password: string
  ) => {
    const user = await userRepository.getByEmail(email);
    if (!user)
      throw new CustomError("No user with the given email exists!", 400);

    const otpCheck = await userServices.checkOTP(email, verificationCode);
    if (!otpCheck || otpCheck.isUsed)
      throw new CustomError("Invalid OTP!", 400);

    const encryptedPassword = await encryptionHelper.encrypt(password);
    user.password = encryptedPassword;
    const updatedUser = await userRepository.update(user.id, user);

    otpCheck.isUsed = true;
    await emailOtpRepository.update(otpCheck.id, otpCheck);

    const sanitizedUser = hideSensitiveData(user, ["password"]);

    return sanitizedUser;
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
        .deleteObject({
          Bucket: s3BucketName,
          Key: `user/${findUser.profilePicture}`,
        })
        .promise();
    }

    if (file) {
      const randomKey = randomUUID();
      const s3Response = await s3
        .upload({
          Bucket: s3BucketName,
          Key: `user/${randomKey}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      data.profilePicture = randomKey;
    }

    const user = await userRepository.update(findUser.id, data);
    const sanitizedUser = hideSensitiveData(user, ["password"]);

    return sanitizedUser;
  },
  delete: async (id: string) => {
    const findUser = await userRepository.getUserById(id);
    if (!findUser) throw new CustomError("User does not exist.", 400);

    if (findUser.profilePicture) {
      await s3
        .deleteObject({
          Bucket: s3BucketName,
          Key: `user/${findUser.profilePicture}`,
        })
        .promise();
    }

    const user = await userRepository.delete(findUser.id);
    const sanitizedUser = hideSensitiveData(user, ["password"]);

    return sanitizedUser;
  },
  updateEmail: async (id: string, email: string, verificationCode: number) => {
    const foundUser = await userRepository.getUserById(id);
    if (!foundUser) throw new CustomError("User does not exist.", 400);

    const emailCheck = await userRepository.getByEmail(email);
    if (emailCheck)
      throw new CustomError("Email has already been registered.", 400);

    const emailOtp = await emailOtpRepository.getByEmail(email.toLowerCase());
    if (!emailOtp || !emailOtp.verificationCode)
      throw new CustomError("No record of OTP was found.", 400);
    if (emailOtp.isUsed)
      throw new CustomError("OTP has already been used.", 400);

    const emailVerificationCode = extractVerification(
      emailOtp.verificationCode
    );

    if (emailVerificationCode !== verificationCode)
      throw new CustomError("Invalid verification code.", 400);

    foundUser.email = email.toLowerCase();

    const user = await userRepository.update(foundUser.id, foundUser);
    emailOtp.isUsed = true;
    await emailOtpRepository.update(emailOtp.id, emailOtp);

    const sanitizedUser = hideSensitiveData(user, ["password"]);

    return sanitizedUser;
  },
  changePassword: async (
    id: string,
    oldPassword: string,
    newPassword: string
  ) => {
    const user = await userRepository.getUserById(id);
    if (!user) throw new CustomError("User not found.", 400);

    const isMatchingPassword = await encryptionHelper.compare(
      oldPassword,
      user.password
    );
    if (!isMatchingPassword) throw new CustomError("Invalid password.", 400);

    const encryptedPassword = await encryptionHelper.encrypt(newPassword);

    user.password = encryptedPassword;
    const updatedUser = await userRepository.update(user.id, user);

    const sanitizedUser = hideSensitiveData(updatedUser, ["password"]);

    return sanitizedUser;
  },
};
