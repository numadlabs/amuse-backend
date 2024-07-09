require("dotenv").config();

const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILLIO_PHONE_NUMBER;

const client = require("twilio")(accountSid, authToken);

export async function sendOTP(
  prefix: string,
  telNumber: string,
  verificationCode: Number
) {
  const message = await client.messages.create({
    body: `Your Amuse Bouche verification code is: ${verificationCode}`,
    to: `+${prefix}${telNumber}`, // Text your number
    from: `${fromPhoneNumber}`,
  });

  return message.sid;
}
