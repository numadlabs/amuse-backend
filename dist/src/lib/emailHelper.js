"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
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
function sendVerificationEmail(verificationCode, toEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = nodemailer_1.default.createTransport(config);
        const info = yield transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: toEmail,
            subject: "Amuse Bouche Verification",
            text: verificationCode.toString(),
        });
        console.log("Sent successfully");
    });
}
exports.sendVerificationEmail = sendVerificationEmail;
