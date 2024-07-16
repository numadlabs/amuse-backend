import { Insertable } from "kysely";
import { Invite } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { restaurantRepository } from "../repository/restaurantRepository";
import { inviteRepository } from "../repository/inviteRepository";
import { employeeRepository } from "../repository/employeeRepository";
import { verificationCodeConstants } from "../lib/constants";
import { generateVerificationToken } from "../utils/jwt";
import { sendEmail } from "../lib/emailHelper";

const MAX = verificationCodeConstants.MAX_VALUE,
  MIN = verificationCodeConstants.MIN_VALUE;

export const inviteServices = {
  create: async (data: Insertable<Invite>) => {
    if (data.emailVerificationCode || data.status)
      throw new CustomError("These fields cannot be inserted.", 400);

    const restaurantCheck = await restaurantRepository.getById(
      data.restaurantId
    );
    if (!restaurantCheck) throw new CustomError("Invalid restaurant.", 400);

    const invite = await inviteRepository.create(data);
    const employee = await employeeRepository.getByEmail(invite.email);
    if (employee) {
      await sendEmail(
        `You have been invited to the ${restaurantCheck.name} on Amuse Bouche`,
        `It seems that you have already registered into our platform. so please handle the restaurant-changing invitation in the app.`,
        invite.email
      );
    } else {
      await sendEmail(
        `You have been invited to the ${restaurantCheck.name} on Amuse Bouche`,
        `inviteId: ${invite.id}\n ene idgaar "hostURL"/employees/:inviteId/register gdg ch ymuu portal-webiin link yvuulna,\n ter linkeer ni orhod inviteId-gaar ni check if email is used gdg API-g duudaj shalgaad success state ni true baival, name/password ntr oruulah form haruulna, false baival haruulahgu aldaa ugdug ch ymuu neg tiimerhuu.\n formoo bugluj duusanguut invite-iin setOTP API-g duudaj emaileer OTP yvuulanguutaa, mobile app deerh shg neg OTP batalgaajuulah hesegruu shiljine, OTP-goo oruulanguutni umnuh formiin data-tai hamt register as employee gdg API-g duudna\n hervee OTP ni zuw baival zuugchuur burtgegdeed duusna, buruu bol aldaa ugnu.`,
        invite.email
      );
    }

    return invite;
  },
  checkIfRegistered: async (id: string) => {
    const invite = await inviteRepository.getById(id);
    if (!invite) throw new CustomError("Invalid invite.", 400);

    const employee = await employeeRepository.getByEmail(invite.email);
    if (employee)
      throw new CustomError(
        "Invited email has already been registered, please handle the invite in the app.",
        400
      );

    return true;
  },
  setOTP: async (id: string) => {
    const invite = await inviteRepository.getById(id);
    if (!invite) throw new CustomError("Invalid invite.", 400);

    const randomNumber = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    const emailVerificationToken = generateVerificationToken(
      randomNumber,
      verificationCodeConstants.EMAIL_EXPIRATION_TIME
    );

    await sendEmail(
      "Amuse Bouche OTP",
      `Your Amuse Bouche verification code is: ${randomNumber}`,
      invite.email
    );

    invite.emailVerificationCode = emailVerificationToken;
    const updatedInvite = await inviteRepository.update(invite, id);

    return invite;
  },
};
