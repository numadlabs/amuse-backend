require("dotenv").config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

export async function sendOTP(
  prefix: string,
  telNumber: string,
  verificationCode: Number
) {
  const message = await client.messages.create({
    body: `Hello, Here is your OTP: ${verificationCode}`,
    to: `+${prefix}${telNumber}`, // Text your number
    from: "+13345185048", // From a valid Twilio number
  });

  return message.sid;
}
