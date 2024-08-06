import { Insertable, Updateable } from "kysely";
import { EmailOtp } from "../types/db/types";
import { db } from "../utils/db";
import { CustomError } from "../exceptions/CustomError";

export const emailOtpRepository = {
  create: async (data: Insertable<EmailOtp>) => {
    const emailOtp = await db
      .insertInto("EmailOtp")
      .values(data)
      .returning(["EmailOtp.id", "EmailOtp.email", "EmailOtp.createdAt"])
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the tempUser.")
      );

    return emailOtp;
  },
  getByEmail: async (email: string) => {
    const emailOtp = await db
      .selectFrom("EmailOtp")
      .selectAll()
      .where("EmailOtp.email", "=", email)
      .orderBy("EmailOtp.createdAt desc")
      .executeTakeFirstOrThrow(() => new CustomError("No OTP found.", 404));

    return emailOtp;
  },
  update: async (id: string, data: Updateable<EmailOtp>) => {
    const emailOtp = await db
      .updateTable("EmailOtp")
      .set(data)
      .returning(["EmailOtp.id", "EmailOtp.email", "EmailOtp.createdAt"])
      .where("EmailOtp.id", "=", id)
      .executeTakeFirstOrThrow(
        () => new Error("Could not create the tempUser.")
      );

    return emailOtp;
  },
};
