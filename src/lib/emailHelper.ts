import nodemailer from "nodemailer";

const hostConfig = {
  host: "mail.privateemail.com",
  port: 465,
};

const config = {
  host: hostConfig.host,
  port: hostConfig.port,
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS, // your email address
    pass: process.env.EMAIL_PASS, // your password
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
    subject: "Amuse Bouche Verification",
    text: verificationCode.toString(),
  });

  console.log("Sent successfully");
  console.log(info);
}
