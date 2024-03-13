"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
const otpHelper_1 = require("../lib/otpHelper");
const userRepository_1 = require("../repository/userRepository");
const emailHelper_1 = require("../lib/emailHelper");
const encryptionHelper_1 = require("../lib/encryptionHelper");
const jwt_1 = require("../utils/jwt");
const CustomError_1 = require("../exceptions/CustomError");
const constants_1 = require("../lib/constants");
const aws_1 = require("../utils/aws");
const crypto_1 = require("crypto");
const MAX = constants_1.verificationCodeConstants.MAX_VALUE, MIN = constants_1.verificationCodeConstants.MIN_VALUE;
exports.userServices = {
    create: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const hasUser = yield userRepository_1.userRepository.getUserByPhoneNumber(data.telNumber, data.prefix);
        if (hasUser)
            throw new CustomError_1.CustomError("User already exists with this phone number", 400);
        const hashedPassword = yield encryptionHelper_1.encryptionHelper.encrypt(data.password);
        data.password = hashedPassword;
        const user = yield userRepository_1.userRepository.create(data);
        return user;
    }),
    login: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userRepository_1.userRepository.getUserByPhoneNumber(data.telNumber, data.prefix);
        if (!user)
            throw new CustomError_1.CustomError("User not found", 400);
        const isUser = yield encryptionHelper_1.encryptionHelper.compare(data.password, user.password);
        if (!isUser)
            throw new CustomError_1.CustomError("Invalid login info.", 400);
        return user;
    }),
    //user return hiihiin orond dugaariin avj boloh ym
    setOTP: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const hasUser = yield userRepository_1.userRepository.getUserByPhoneNumber(data.telNumber, data.prefix);
        if (!hasUser)
            throw new CustomError_1.CustomError("User does not exist!", 400);
        const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
        const telVerificationToken = (0, jwt_1.generateVerificationToken)(randomNumber, constants_1.verificationCodeConstants.TEL_EXPIRATION_TIME);
        const isSent = yield (0, otpHelper_1.sendOTP)(data.prefix, data.telNumber, randomNumber);
        if (!isSent)
            throw new Error("Error has occured while sending the OTP.");
        hasUser.telVerificationCode = telVerificationToken;
        const user = yield userRepository_1.userRepository.update(hasUser.id, hasUser);
        return user;
    }),
    verifyOTP: (id, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
        const hasUser = yield userRepository_1.userRepository.getUserById(id);
        if (!hasUser || !hasUser.telVerificationCode)
            throw new CustomError_1.CustomError("User does not exist!", 400);
        const telVerificationCode = (0, jwt_1.extractVerification)(hasUser.telVerificationCode);
        if (telVerificationCode !== verificationCode ||
            hasUser.telVerificationCode === null)
            throw new CustomError_1.CustomError("Invalid verification code!", 400);
        hasUser.isTelVerified = true;
        hasUser.telVerificationCode = null;
        const user = yield userRepository_1.userRepository.update(hasUser.id, hasUser);
        return user;
    }),
    checkOTP: (id, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userRepository_1.userRepository.getUserById(id);
        if (!user || !user.telVerificationCode)
            throw new CustomError_1.CustomError("User does not exist!", 400);
        const telVerificationCode = (0, jwt_1.extractVerification)(user.telVerificationCode);
        if (telVerificationCode !== verificationCode ||
            user.telVerificationCode === null)
            throw new CustomError_1.CustomError("Invalid verification code!", 400);
        return user;
    }),
    changePassword: (id, verificationCode, password) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield exports.userServices.checkOTP(id, verificationCode);
        const encryptedPassword = yield encryptionHelper_1.encryptionHelper.encrypt(password);
        user.password = encryptedPassword;
        user.telVerificationCode = null;
        const updatedUser = yield userRepository_1.userRepository.update(id, user);
        return updatedUser;
    }),
    //consider using hooks for when email is updated setting the isEmailVerified to false
    setEmailVerification: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const userById = yield userRepository_1.userRepository.getUserById(id);
        if (!userById || !userById.email)
            throw new CustomError_1.CustomError("User does not exist or Has no email.", 400);
        if (userById.isEmailVerified)
            throw new CustomError_1.CustomError("User's email is already verified.", 400);
        const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
        const emailVerificationToken = (0, jwt_1.generateVerificationToken)(randomNumber, constants_1.verificationCodeConstants.EMAIL_EXPIRATION_TIME);
        yield (0, emailHelper_1.sendVerificationEmail)(randomNumber, userById.email);
        userById.emailVerificationCode = emailVerificationToken;
        const user = yield userRepository_1.userRepository.update(userById.id, userById);
        return user;
    }),
    verifyEmailVerification: (id, verificationCode) => __awaiter(void 0, void 0, void 0, function* () {
        const foundUser = yield userRepository_1.userRepository.getUserById(id);
        if (!foundUser || !foundUser.email)
            throw new CustomError_1.CustomError("User does not exist or Has no email.", 400);
        if (!foundUser.emailVerificationCode || foundUser.isEmailVerified)
            throw new CustomError_1.CustomError("No verification code send/recorded or email is already verified.", 400);
        const emailVerificationCode = (0, jwt_1.extractVerification)(foundUser.emailVerificationCode);
        if (emailVerificationCode !== verificationCode)
            throw new CustomError_1.CustomError("Invalid verification code.", 400);
        foundUser.isEmailVerified = true;
        foundUser.emailVerifiedAt = new Date();
        foundUser.emailVerificationCode = null;
        const user = yield userRepository_1.userRepository.update(foundUser.id, foundUser);
        return user;
    }),
    update: (id, data, file) => __awaiter(void 0, void 0, void 0, function* () {
        const findUser = yield userRepository_1.userRepository.getUserById(id);
        if (!findUser)
            throw new CustomError_1.CustomError("User does not exist.", 400);
        if (file && findUser.profilePicture) {
            yield aws_1.s3
                .deleteObject({ Bucket: constants_1.s3BucketName, Key: findUser.profilePicture })
                .promise();
        }
        if (file) {
            const s3Response = yield aws_1.s3
                .upload({
                Bucket: constants_1.s3BucketName,
                Key: (0, crypto_1.randomUUID)(),
                Body: file.buffer,
                ContentType: file.mimetype,
            })
                .promise();
            data.profilePicture = s3Response.Key;
        }
        const user = yield userRepository_1.userRepository.update(findUser.id, data);
        return user;
    }),
    //add cascading effects
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const findUser = yield userRepository_1.userRepository.getUserById(id);
        if (!findUser)
            throw new CustomError_1.CustomError("User does not exist.", 400);
        if (findUser.profilePicture) {
            yield aws_1.s3
                .deleteObject({ Bucket: constants_1.s3BucketName, Key: findUser.profilePicture })
                .promise();
        }
        const user = yield userRepository_1.userRepository.delete(findUser.id);
        return user;
    }),
};
