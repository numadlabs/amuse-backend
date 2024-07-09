import nodemailer from "nodemailer";

const config = {
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
};

export async function sendVerificationEmail(
  verificationCode: number,
  toEmail: string
) {
  const transporter = nodemailer.createTransport(config);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: toEmail,
    subject: "Amuse Bouche OTP",
    text: `Your Amuse Bouche verification code is: ${verificationCode}`,
  });

  console.log("Sent successfully: ", info);
}
