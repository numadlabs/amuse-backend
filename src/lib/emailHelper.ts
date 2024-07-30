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

export async function sendEmail(
  subject: string,
  text: string,
  toEmail: string
) {
  const transporter = nodemailer.createTransport(config);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_ADDRESS,
    to: toEmail,
    subject: subject,
    text: text,
  });

  return info;
}
