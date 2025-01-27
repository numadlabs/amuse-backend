import { Insertable, Updateable } from "kysely";
import { CustomError } from "../exceptions/CustomError";
import { verificationCodeConstants } from "../lib/constants";
import {
  generateCredententialsMessage,
  generateOtpMessage,
  sendEmail,
} from "../lib/emailHelper";
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
import { db } from "../utils/db";
import { auditTrailRepository } from "../repository/auditTrailRepository";
import { generateRandomPassword } from "../lib/generateRandomPassword";
const crypto = require("crypto");

const MAX = verificationCodeConstants.MAX_VALUE,
  MIN = verificationCodeConstants.MIN_VALUE;

export const employeeServices = {
  create: async (data: Insertable<Employee>, issuerId: string) => {
    if (data.role === "SUPER_ADMIN" || data.role === "USER")
      throw new CustomError("Could not the the role to the given one.", 400);

    const emailCheck = await employeeRepository.getByEmail(data.email);
    if (emailCheck && emailCheck.isActive)
      throw new CustomError("Email has already been registered.", 400);

    if (!data.restaurantId)
      throw new CustomError("Please provide a restaurantId.", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      data.restaurantId
    );
    if (issuer.role !== "RESTAURANT_OWNER" && data.role === "RESTAURANT_OWNER")
      throw new CustomError("You are not allowed to do this action.", 400);

    const restaurant = await restaurantRepository.getById(
      db,
      data.restaurantId
    );
    if (!restaurant) throw new CustomError("Restaurant not found.", 400);

    const password = generateRandomPassword();
    const hashedPassword = await encryptionHelper.encrypt(password);

    const result = await db.transaction().execute(async (trx) => {
      const message = generateCredententialsMessage(data.email, password);
      await sendEmail(
        "Welcome to Amuse Bouche – Your Login Credentials",
        message,
        data.email
      );

      data.password = hashedPassword;
      const employee = await employeeRepository.create(trx, data);

      await auditTrailRepository.create(trx, {
        tableName: "EMPLOYEE",
        operation: "INSERT",
        data: employee,
        updatedEmployeeId: issuer.id,
      });

      return employee;
    });

    return result;
  },
  createAsSuperAdmin: async (data: Insertable<Employee>, issuerId: string) => {
    if (data.role === "SUPER_ADMIN" || data.role === "USER")
      throw new CustomError("Error on the role input.", 400);

    if (data.role !== "RESTAURANT_OWNER" && !data.restaurantId)
      throw new CustomError(
        "Please provide a restaurantId for this type of role.",
        400
      );

    const emailCheck = await employeeRepository.getByEmail(data.email);
    if (emailCheck && emailCheck.isActive)
      throw new CustomError("Email has already been registed.", 400);

    const password = generateRandomPassword();
    const hashedPassword = await encryptionHelper.encrypt(password);

    const result = await db.transaction().execute(async (trx) => {
      const message = generateCredententialsMessage(data.email, password);
      await sendEmail(
        "Welcome to Amuse Bouche – Your Login Credentials",
        message,
        data.email
      );

      data.password = hashedPassword;
      const employee = await employeeRepository.create(trx, data);
      await auditTrailRepository.create(trx, {
        tableName: "EMPLOYEE",
        operation: "INSERT",
        data: employee,
        updatedEmployeeId: issuerId,
      });

      return employee;
    });

    return result;
  },
  updateInfo: async (
    data: Updateable<Employee>,
    id: string,
    issuerId: string
  ) => {
    const checkExists = await employeeRepository.getById(id);
    if (!checkExists) throw new CustomError("Invalid employee.", 400);

    if (issuerId !== checkExists.id)
      throw new CustomError("You are not allowed to do this action.", 400);

    const employee = await employeeRepository.update(id, data);

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
    const { accessToken, refreshToken } = generateTokens({
      id: employee.id,
      role: employee.role,
    });

    const sanitizedEmployee = hideSensitiveData(employee, ["password"]) as Omit<
      Employee,
      "password"
    >;

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

    const result = await db.transaction().execute(async (trx) => {
      const message = generateOtpMessage(randomNumber);
      const isSent = await sendEmail("Amuse Bouche OTP", message, email);
      if (!isSent.accepted)
        throw new Error("Error has occured while sending the OTP.");

      await emailOtpRepository.expireAllPreviousOtpsByEmail(trx, email);
      await emailOtpRepository.create(trx, {
        email: email,
        verificationCode: emailVerificationToken,
      });
    });

    return employeeById;
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
    employee.passwordUpdateAt = new Date();

    const updatedEmployee = await employeeRepository.update(
      employee.id,
      employee
    );

    emailOtp.isUsed = true;
    await emailOtpRepository.update(emailOtp.id, emailOtp);

    const sanitizedEmployee = hideSensitiveData(updatedEmployee, ["password"]);

    return sanitizedEmployee;
  },
  checkIfEligible: async (employeeId: string, restaurantId: string) => {
    const employee = await employeeRepository.getById(employeeId);
    if (!employee) throw new CustomError("Employee does not exist.", 400);

    if (!employee.isActive)
      throw new CustomError("You have been removed from this team.", 400);
    if (!employee.restaurantId)
      throw new CustomError("You are not authorized to do this action.", 400);
    if (employee.restaurantId !== restaurantId)
      throw new CustomError("You are not authorized to do this action.", 400);

    return employee;
  },
  updateRole: async (role: ROLES, id: string, issuerId: string) => {
    const employeeToUpdate = await employeeRepository.getById(id);
    if (!employeeToUpdate || !employeeToUpdate.restaurantId)
      throw new CustomError("Please select an valid employee.", 400);
    if (role === "SUPER_ADMIN" || role === "USER")
      throw new CustomError(
        "Could not update the employees role into the given one.",
        400
      );

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      employeeToUpdate.restaurantId
    );
    if (issuer.role !== "RESTAURANT_OWNER" && role === "RESTAURANT_OWNER")
      throw new CustomError("You are not allowed to do this action.", 400);

    const employee = await employeeRepository.update(id, { role: role });

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
    employee.passwordUpdateAt = new Date();

    const updatedEmployee = await employeeRepository.update(
      employee.id,
      employee
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
  removeFromTeam: async (id: string, issuerId: string) => {
    const employeeToRemove = await employeeRepository.getById(id);
    if (!employeeToRemove) throw new CustomError("Invalid employeeId.", 400);
    if (!employeeToRemove.restaurantId)
      throw new CustomError("Employee does not belong to any restaurant.", 400);
    if (employeeToRemove.id === issuerId)
      throw new CustomError("You cannot remove yourself from the team.", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      employeeToRemove.restaurantId
    );
    if (
      issuer.role === "RESTAURANT_MANAGER" &&
      employeeToRemove.role === "RESTAURANT_OWNER"
    )
      throw new CustomError(
        "You are not allowed to remove employee with owner role.",
        400
      );

    if (
      issuer.role === "RESTAURANT_MANAGER" &&
      employeeToRemove.role === "RESTAURANT_MANAGER"
    )
      throw new CustomError(
        "You are not allowed to remove employee with manager role.",
        400
      );

    employeeToRemove.isActive = false;
    employeeToRemove.deletedAt = new Date();
    const employee = await employeeRepository.update(id, employeeToRemove);

    await auditTrailRepository.create(db, {
      tableName: "EMPLOYEE",
      operation: "DELETE",
      data: employee,
      updatedEmployeeId: issuer.id,
    });

    return employee;
  },
  createPasswordOnboarding: async (password: string, userId: string) => {
    const employee = await employeeRepository.getById(userId);
    if (!employee) throw new CustomError("Invalid employeeId.", 400);
    if (employee.isOnboarded)
      throw new CustomError(
        "You can only use this during the onboarding process.",
        400
      );

    const encryptedPassword = await encryptionHelper.encrypt(password);

    employee.password = encryptedPassword;
    employee.passwordUpdateAt = new Date();
    employee.isOnboarded = true;

    const updatedEmployee = await employeeRepository.update(
      employee.id,
      employee
    );

    const sanitizedEmployee = hideSensitiveData(updatedEmployee, ["password"]);

    return sanitizedEmployee;
  },
  getByRestaurantId: async (restaurantId: string, issuerId: string) => {
    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      restaurantId
    );

    if (!issuer)
      throw new CustomError("You are not allowed to do this action.", 400);

    const employees = await employeeRepository.getByRestaurantId(restaurantId);

    return employees;
  },
};
