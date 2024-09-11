import { userRepository } from "../repository/userRepository";
import { sendEmail } from "../lib/emailHelper";
import { encryptionHelper } from "../lib/encryptionHelper";
import {
  extractVerification,
  generateTokens,
  generateVerificationToken,
} from "../utils/jwt";
import { CustomError } from "../exceptions/CustomError";
import { deleteFromS3, s3, uploadToS3 } from "../utils/aws";
import { randomUUID } from "crypto";
import { Updateable } from "kysely";
import { User } from "../types/db/types";
import { userTierRepository } from "../repository/userTierRepository";
import { emailOtpRepository } from "../repository/emailOtpRepository";
import { hideSensitiveData } from "../lib/hideDataHelper";
import { userCardReposity } from "../repository/userCardRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { tapRepository } from "../repository/tapRepository";
import { restaurantRepository } from "../repository/restaurantRepository";
import { db } from "../utils/db";
import { verificationCodeConstants } from "../lib/constants";
import { countryRepository } from "../repository/countryRepository";

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
    if (!emailOtp || !emailOtp.verificationCode)
      throw new CustomError(
        "Please send OTP first and then provide the verificationCode.",
        400
      );

    if (emailOtp.isUsed)
      throw new CustomError("OTP has already been used.", 400);

    const emailVerificationCode = extractVerification(
      emailOtp.verificationCode
    );

    if (emailVerificationCode !== verificationCode)
      throw new CustomError("Invalid verification code!", 400);

    const hashedPassword = await encryptionHelper.encrypt(password);
    const userTier = await userTierRepository.getStartingTier();

    const user = await userRepository.create({
      email: email,
      password: hashedPassword,
      nickname,
      userTierId: userTier.id,
    });

    emailOtp.isUsed = true;
    await emailOtpRepository.update(emailOtp.id, emailOtp);

    const { accessToken, refreshToken } = generateTokens(user);

    const sanitizedUser = hideSensitiveData(user, ["password"]) as Omit<
      User,
      "password"
    >;

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
    const randomNumber =
      Math.floor(
        Math.random() *
          (verificationCodeConstants.MAX_VALUE -
            verificationCodeConstants.MIN_VALUE +
            1)
      ) + verificationCodeConstants.MIN_VALUE;
    const emailVerificationToken = generateVerificationToken(
      randomNumber,
      verificationCodeConstants.EMAIL_EXPIRATION_TIME
    );

    const result = await db.transaction().execute(async (trx) => {
      const isSent = await sendEmail(
        "Amuse Bouche OTP",
        `Your Amuse Bouche verification code is: ${randomNumber}`,
        email
      );
      if (!isSent.accepted)
        throw new Error("Error has occured while sending the OTP.");

      await emailOtpRepository.create(trx, {
        email: email.toLowerCase(),
        verificationCode: emailVerificationToken,
      });
    });

    return true;
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
      throw new CustomError("Invalid verification code.", 400);

    return emailOtp;
  },
  forgotPassword: async (
    email: string,
    verificationCode: number,
    password: string
  ) => {
    const user = await userRepository.getByEmail(email);
    if (!user)
      throw new CustomError("No user with the given email exists.", 400);

    const otpCheck = await userServices.checkOTP(email, verificationCode);
    if (!otpCheck || otpCheck.isUsed)
      throw new CustomError("Invalid OTP!", 400);

    const encryptedPassword = await encryptionHelper.encrypt(password);
    user.password = encryptedPassword;
    const updatedUser = await userRepository.update(db, user.id, user);

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

    if (data.countryId === "") data.countryId = null;

    if (data.countryId) {
      const countryCheck = await countryRepository.getById(data.countryId);
      if (!countryCheck) throw new CustomError("Invalid countryId.", 400);
    }

    const result = await db.transaction().execute(async (trx) => {
      if ((file && findUser.profilePicture) || data.profilePicture === "") {
        await deleteFromS3(`user/${findUser.profilePicture}`);
        data.profilePicture = null;
      }

      if (file) {
        const randomKey = randomUUID();
        await uploadToS3(`user/${randomKey}`, file);
        data.profilePicture = randomKey;
      }

      const user = await userRepository.update(trx, findUser.id, data);

      return user;
    });
    const sanitizedUser = hideSensitiveData(result, ["password"]);

    return sanitizedUser;
  },
  delete: async (id: string) => {
    const findUser = await userRepository.getUserById(id);
    if (!findUser) throw new CustomError("User does not exist.", 400);

    const result = await db.transaction().execute(async (trx) => {
      if (findUser.profilePicture)
        await deleteFromS3(`user/${findUser.profilePicture}`);

      const userCards = await userCardReposity.getByUserIdWithRestaurantDetails(
        findUser.id
      );
      const updatePromises = userCards.map((userCard) =>
        restaurantRepository.increaseBalanceByRestaurantId(
          userCard.restaurantId,
          userCard.balance
        )
      );
      await Promise.all(updatePromises);

      const user = await userRepository.delete(trx, findUser.id);

      return user;
    });

    const sanitizedUser = hideSensitiveData(result, ["password"]);

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

    const user = await userRepository.update(db, foundUser.id, foundUser);
    emailOtp.isUsed = true;
    await emailOtpRepository.update(emailOtp.id, emailOtp);

    const sanitizedUser = hideSensitiveData(user, ["password"]);

    return sanitizedUser;
  },
  changePassword: async (
    id: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await userRepository.getUserById(id);
    if (!user) throw new CustomError("User not found.", 400);

    const isMatchingPassword = await encryptionHelper.compare(
      currentPassword,
      user.password
    );
    if (!isMatchingPassword) throw new CustomError("Invalid password.", 400);

    const encryptedPassword = await encryptionHelper.encrypt(newPassword);

    user.password = encryptedPassword;
    const updatedUser = await userRepository.update(db, user.id, user);

    const sanitizedUser = hideSensitiveData(updatedUser, ["password"]);

    return sanitizedUser;
  },
  fetchCollectedData: async (id: string) => {
    const user = await userRepository.getUserById(id);
    if (!user) throw new CustomError("User not found.", 400);

    const cards = await userCardReposity.getByUserIdWithRestaurantDetails(
      user.id
    );

    const bonuses = await userBonusRepository.getAllByUserId(user.id);

    const taps = await tapRepository.getAllByUserId(user.id);

    const sanitizedUser = hideSensitiveData(user, [
      "password",
      "createdAt",
      "id",
      "profilePicture",
      "userTierId",
      "role",
    ]);

    return {
      ...sanitizedUser,
      cards,
      bonuses,
      taps,
    };
  },
};
