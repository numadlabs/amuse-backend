import nodemailer from "nodemailer";
import { config } from "../config/config";

const template = {
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.EMAIL_ADDRESS,
    pass: config.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
};

export async function sendEmail(
  subject: string,
  text: string,
  toEmail: string
) {
  const transporter = nodemailer.createTransport(template);

  const info = await transporter.sendMail({
    from: config.EMAIL_ADDRESS,
    to: toEmail,
    subject: subject,
    text: text,
  });

  return info;
}
