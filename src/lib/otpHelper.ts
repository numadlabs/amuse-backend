const accountSid = "AC2411ad2e6e81331292f5e6b0a783e384";
const authToken = "58be35590c05ac5ece4b86aab3ca4342";

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
