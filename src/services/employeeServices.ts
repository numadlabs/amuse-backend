import { Insertable, Updateable } from "kysely";
import { CustomError } from "../exceptions/CustomError";
import { verificationCodeConstants } from "../lib/constants";
import { sendEmail } from "../lib/emailHelper";
import { encryptionHelper } from "../lib/encryptionHelper";
import { employeeRepository } from "../repository/employeeRepository";
import {
  extractVerification,
  generateTokens,
  generateVerificationToken,
} from "../utils/jwt";
import { Employee } from "../types/db/types";
import { restaurantRepository } from "../repository/restaurantRepository";
import { ROLES } from "../types/db/enums";
import { emailOtpRepository } from "../repository/emailOtpRepository";
import { hideSensitiveData } from "../lib/hideDataHelper";
const crypto = require("crypto");

const MAX = verificationCodeConstants.MAX_VALUE,
  MIN = verificationCodeConstants.MIN_VALUE;

export const employeeServices = {
  create: async (data: Insertable<Employee>, creatorId: string) => {
    if (data.role === "SUPER_ADMIN" || data.role === "USER")
      throw new CustomError("Could not the the role to the given one.", 400);

    const emailCheck = await employeeRepository.getByEmail(data.email);
    if (emailCheck)
      throw new CustomError("Email has already been registed.", 400);

    const creator = await employeeRepository.getById(creatorId);
    if (!creator || creator.restaurantId !== data.restaurantId)
      throw new CustomError(
        "You are not allowed to create employee for this restaurant.",
        400
      );

    if (creator.role !== "RESTAURANT_OWNER" && data.role === "RESTAURANT_OWNER")
      throw new CustomError("You are not allowed to do this action.", 400);

    if (!data.restaurantId)
      throw new CustomError("Please provide a restaurantId.", 400);

    const restaurant = await restaurantRepository.getById(data.restaurantId);
    if (!restaurant) throw new CustomError("Restaurant not found.", 400);

    const password = crypto.randomBytes(16).toString("base64").slice(0, 16);
    const hashedPassword = await encryptionHelper.encrypt(password);

    data.firstname = restaurant.name;
    data.lastname = "Employee";
    data.password = hashedPassword;
    const employee = await employeeRepository.create(data);

    await sendEmail(
      "Welcome to Amuse Bouche – Your Login Details",
      `
Welcome to Amuse Bouche! We’re thrilled to have you join our team. Your restaurant owner has invited you to use our platform.

To get started, please use the following credentials to log in to your account:

Login Email: ${data.email}
Password: ${password}

Thank you for joining Amuse Bouche. We’re here to support you every step of the way!

Best regards,  
The Amuse Bouche Team
`,
      employee.email
    );

    return employee;
  },
  createAsSuperAdmin: async (data: Insertable<Employee>) => {
    if (data.role === "SUPER_ADMIN" || data.role === "USER")
      throw new CustomError("Error on the role input.", 400);

    const emailCheck = await employeeRepository.getByEmail(data.email);
    if (emailCheck)
      throw new CustomError("Email has already been registed.", 400);

    const password = crypto.randomBytes(16).toString("base64").slice(0, 16);
    const hashedPassword = await encryptionHelper.encrypt(password);

    data.password = hashedPassword;
    const employee = await employeeRepository.create(data);

    if (!employee.restaurantId)
      await sendEmail(
        "Welcome to Amuse Bouche – Your Login Details",
        `
Welcome to Amuse Bouche! We’re excited to have you on board and look forward to helping you set up your restaurant profile.

To get started, please use the following credentials to log in to your account and complete your profile setup:

Login Email: ${employee.email}
Password: ${password}

Best regards,  
The Amuse Bouche Team
`,
        employee.email
      );

    return employee;
  },
  updateInfo: async (
    data: Updateable<Employee>,
    id: string,
    issuerId: string
  ) => {
    const checkExists = await employeeRepository.getById(id);
    if (!checkExists) throw new CustomError("Invalid employeeId.", 400);

    if (issuerId !== checkExists.id)
      throw new CustomError("You are not allowed to do this action.", 400);

    const employee = await employeeRepository.update(data, id);

    return employee;
  },
  login: async (email: string, password: string) => {
    const employee = await employeeRepository.getByEmail(email);
    if (!employee) throw new CustomError("Employee not found.", 400);

    const isEmployee = await encryptionHelper.compare(
      password,
      employee.password
    );

    if (!isEmployee) throw new CustomError("Invalid login info.", 400);
    const { accessToken, refreshToken } = generateTokens(employee);

    const sanitizedEmployee = hideSensitiveData(employee, ["password"]);

    return { employee: sanitizedEmployee, accessToken, refreshToken };
  },
  setEmailOTP: async (email: string) => {
    const employeeById = await employeeRepository.getByEmail(email);

    if (!employeeById) throw new CustomError("Employee does not exist.", 400);

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const emailVerificationToken = generateVerificationToken(
      randomNumber,
      verificationCodeConstants.EMAIL_EXPIRATION_TIME
    );

    await sendEmail(
      "Amuse Bouche OTP",
      `Your Amuse Bouche verification code is: ${randomNumber}`,
      employeeById.email
    );

    await emailOtpRepository.create({
      email: email.toLowerCase(),
      verificationCode: emailVerificationToken,
    });

    const employee = await employeeRepository.update(
      employeeById,
      employeeById.id
    );

    return employee;
  },
  checkEmailOTP: async (email: string, verificationCode: number) => {
    const employee = await employeeRepository.getByEmail(email);

    if (!employee) throw new CustomError("Employee does not exist.", 400);

    const emailOtp = await emailOtpRepository.getByEmail(email);
    const extractedOTP = extractVerification(emailOtp.verificationCode);
    if (extractedOTP !== verificationCode)
      throw new CustomError("Invalid verification code!", 400);

    return employee;
  },
  forgotPassword: async (
    email: string,
    verificationCode: number,
    password: string
  ) => {
    const employee = await employeeServices.checkEmailOTP(
      email,
      verificationCode
    );

    const emailOtp = await emailOtpRepository.getByEmail(email);
    const extractedOTP = extractVerification(emailOtp.verificationCode);
    if (extractedOTP !== verificationCode)
      throw new CustomError("Invalid verification code!", 400);

    const encryptedPassword = await encryptionHelper.encrypt(password);

    employee.password = encryptedPassword;

    const updatedEmployee = await employeeRepository.update(
      employee,
      employee.id
    );

    emailOtp.isUsed = true;

    await emailOtpRepository.update(emailOtp.id, emailOtp);

    const sanitizedEmployee = hideSensitiveData(updatedEmployee, ["password"]);

    return sanitizedEmployee;
  },
  checkIfEligible: async (employeeId: string, restaurantId: string) => {
    const employee = await employeeRepository.getById(employeeId);
    if (!employee) throw new CustomError("Employee does not exist.", 400);

    if (!employee.restaurantId)
      throw new CustomError("You are not authorized to do this action.", 400);

    if (employee.restaurantId !== restaurantId)
      throw new CustomError("You are not authorized to do this action.", 400);

    return employee;
  },
  updateRole: async (role: ROLES, id: string, issuerId: string) => {
    if (role === "SUPER_ADMIN" || role === "USER")
      throw new CustomError(
        "Could not update the employees role into the given one.",
        400
      );

    const checkExists = await employeeRepository.getById(id);
    if (!checkExists) throw new CustomError("Invalid employeeId.", 400);

    const issuer = await employeeRepository.getById(issuerId);
    if (!issuer || issuer.restaurantId !== checkExists.restaurantId)
      throw new CustomError("You are not allowed to do this action.", 400);

    if (issuer.role !== "RESTAURANT_OWNER" && role === "RESTAURANT_OWNER")
      throw new CustomError("You are not allowed to do this action.", 400);

    const employee = await employeeRepository.update({ role: role }, id);

    return employee;
  },
  changePassword: async (
    id: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const employee = await employeeServices.checkPassword(id, currentPassword);

    const encryptedPassword = await encryptionHelper.encrypt(newPassword);

    employee.password = encryptedPassword;
    const updatedEmployee = await employeeRepository.update(
      employee,
      employee.id
    );
    const sanitizedEmployee = hideSensitiveData(updatedEmployee, ["password"]);

    return sanitizedEmployee;
  },
  checkPassword: async (id: string, currentPassword: string) => {
    const employee = await employeeRepository.getById(id);
    if (!employee) throw new CustomError("Invalid employeeId.", 400);

    const isMatchingPassword = await encryptionHelper.compare(
      currentPassword,
      employee.password
    );
    if (!isMatchingPassword) throw new CustomError("Invalid password.", 400);

    return employee;
  },
};
