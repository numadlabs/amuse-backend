import nodemailer from "nodemailer";
import { config } from "../config/config";

const template = {
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.EMAIL_ADDRESS,
    pass: config.EMAIL_PASS,
  },
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

export function generateOtpMessage(verificationCode: number) {
  const message = `Your Amuse Bouche verification code is: ${verificationCode}.

This one-time password (OTP) will expire in 5 minutes. Please complete the authentication process as soon as possible.

If you did not request this OTP, kindly ignore this email.

Best regards,  
The Amuse Bouche Team`;

  return message;
}

export function generateCredententialsMessage(email: string, password: string) {
  const message = `Welcome to Amuse Bouche! We’re thrilled to have you join our team. Your restaurant owner has invited you to use our platform.
  
To get started, please use the following credentials to log in to your account:
  
Login Email: ${email}
Password: ${password}
  
Thank you for joining Amuse Bouche. We’re here to support you every step of the way!
  
Best regards,  
The Amuse Bouche Team`;

  return message;
}
