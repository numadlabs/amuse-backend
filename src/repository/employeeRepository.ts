import { Insertable, Updateable } from "kysely";
import { Employee } from "../types/db/types";
import { db } from "../utils/db";

export const employeeRepository = {
  getById: async (id: string) => {
    const employee = await db
      .selectFrom("Employee")
      .selectAll()
      .where("Employee.id", "=", id)
      .executeTakeFirst();

    return employee;
  },
  create: async (data: Insertable<Employee>) => {
    const employee = await db
      .insertInto("Employee")
      .values(data)
      .returning([
        "Employee.id",
        "Employee.fullname",
        "Employee.email",
        "Employee.role",
        "Employee.restaurantId",
        "Employee.passwordUpdateAt",
      ])
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the employee.")
      );

    return employee;
  },
  update: async (id: string, data: Updateable<Employee>) => {
    const employee = await db
      .updateTable("Employee")
      .set(data)
      .returningAll()
      .where("Employee.id", "=", id)
      .executeTakeFirstOrThrow(
        () => new Error("Could not update the employee.")
      );

    return employee;
  },
  getByEmail: async (email: string) => {
    const employee = await db
      .selectFrom("Employee")
      .selectAll()
      .where("Employee.email", "=", email)
      .executeTakeFirst();

    return employee;
  },
  getByRestaurantId: async (restaurantId: string) => {
    const employee = await db
      .selectFrom("Employee")
      .select([
        "Employee.id",
        "Employee.email",
        "Employee.fullname",
        "Employee.role",
        "Employee.createdAt",
      ])
      .where("Employee.restaurantId", "=", restaurantId)
      .execute();

    return employee;
  },
};
