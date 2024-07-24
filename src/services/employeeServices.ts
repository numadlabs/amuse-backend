import { Insertable, Updateable } from "kysely";
import { CustomError } from "../exceptions/CustomError";
import { verificationCodeConstants } from "../lib/constants";
import { sendEmail } from "../lib/emailHelper";
import { encryptionHelper } from "../lib/encryptionHelper";
import { employeeRepository } from "../repository/employeeRepository";
import { extractVerification, generateVerificationToken } from "../utils/jwt";
import { Employee } from "../types/db/types";
import { restaurantRepository } from "../repository/restaurantRepository";

const MAX = verificationCodeConstants.MAX_VALUE,
  MIN = verificationCodeConstants.MIN_VALUE;

export const employeeServices = {
  create: async (data: Insertable<Employee>, creatorId: string) => {
    if (data.role === "SUPER_ADMIN" || data.role === "USER" || !data.role)
      throw new CustomError("Error on the role input.", 400);

    const emailCheck = await employeeRepository.getByEmail(data.email);
    if (emailCheck)
      throw new CustomError("Email has already been registed.", 400);

    const creator = await employeeRepository.getById(creatorId);
    if (!creator || creator.restaurantId !== data.restaurantId)
      throw new CustomError(
        "You are not allowed to create employee for this restaurant.",
        400
      );

    if (!data.restaurantId)
      throw new CustomError("Please provide a restaurantId.", 400);

    const restaurant = await restaurantRepository.getById(data.restaurantId);
    if (!restaurant) throw new CustomError("Restaurant not found.", 400);

    const password = data.password;

    const hashedPassword = await encryptionHelper.encrypt(password);
    data.password = hashedPassword;
    data.firstname = restaurant.name;
    data.lastname = "Waiter";

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
    if (data.role === "SUPER_ADMIN" || data.role === "USER" || !data.role)
      throw new CustomError("Error on the role input.", 400);

    const emailCheck = await employeeRepository.getByEmail(data.email);
    if (emailCheck)
      throw new CustomError("Email has already been registed.", 400);

    const password = data.password;

    const hashedPassword = await encryptionHelper.encrypt(data.password);
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
  update: async (data: Updateable<Employee>, id: string) => {
    if (data.role || data.password || data.id || data.emailVerificationCode)
      throw new CustomError("These fields cannot be updated.", 400);

    if (data.restaurantId) {
      const restaurant = await restaurantRepository.getById(data.restaurantId);
      if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);
    }

    const checkExists = await employeeRepository.getById(id);
    if (!checkExists) throw new CustomError("Invalid employeeId.", 400);

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

    return employee;
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

    employeeById.emailVerificationCode = emailVerificationToken;
    const employee = await employeeRepository.update(
      employeeById,
      employeeById.id
    );

    return employee;
  },
  checkEmailOTP: async (email: string, verificationCode: number) => {
    const employee = await employeeRepository.getByEmail(email);

    if (!employee || !employee.emailVerificationCode)
      throw new CustomError("Employee does not exist or no OTP set.", 400);

    const extractedOTP = extractVerification(employee.emailVerificationCode);

    if (
      extractedOTP !== verificationCode ||
      employee.emailVerificationCode === null
    )
      throw new CustomError("Invalid verification code!", 400);

    return employee;
  },
  changePassword: async (
    email: string,
    verificationCode: number,
    password: string
  ) => {
    const employee = await employeeServices.checkEmailOTP(
      email,
      verificationCode
    );

    const encryptedPassword = await encryptionHelper.encrypt(password);

    employee.password = encryptedPassword;
    employee.emailVerificationCode = null;

    const updatedEmployee = await employeeRepository.update(
      employee,
      employee.id
    );

    return updatedEmployee;
  },
};
