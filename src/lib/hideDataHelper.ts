import { Employee, User } from "../types/db/types";
import { Updateable } from "kysely";

export const hideDataHelper = {
  sanitizeUserData: (data: Updateable<User>) => {
    const { password, ...user } = data;
    return user;
  },
  sanitizeEmployeeData: (data: Updateable<Employee>) => {
    const { password, emailVerificationCode, ...employee } = data;
    return employee;
  },
};
