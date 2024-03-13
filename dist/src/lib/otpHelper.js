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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = void 0;
require("dotenv").config();
const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILLIO_PHONE_NUMBER;
const client = require("twilio")(accountSid, authToken);
function sendOTP(prefix, telNumber, verificationCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = yield client.messages.create({
            body: `Hello, Here is your OTP: ${verificationCode}`,
            to: `+${prefix}${telNumber}`, // Text your number
            from: `${fromPhoneNumber}`,
        });
        return message.sid;
    });
}
exports.sendOTP = sendOTP;
