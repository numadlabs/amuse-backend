import { Employee, User } from "../types/db/types";
import { Updateable } from "kysely";

export const hideDataHelper = {
  sanitizeUserData: (data: Updateable<User>) => {
    const { password, emailVerificationCode, telVerificationCode, ...user } =
      data;
    return user;
  },
  sanitizeEmployeeData: (data: Updateable<Employee>) => {
    const { password, emailVerificationCode, ...employee } = data;
    return employee;
  },
};
