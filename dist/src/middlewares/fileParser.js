"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = void 0;
const multer_1 = __importDefault(require("multer"));
const constants_1 = require("../lib/constants");
const storage = multer_1.default.memoryStorage();
const uploader = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: constants_1.fileSizeLimit },
});
function parseFile(fieldName) {
    return function uploadFile(req, res, next) {
        const upload = uploader.single(fieldName);
        upload(req, res, function (err) {
            if (err instanceof multer_1.default.MulterError) {
                return res.status(400).json(err);
            }
            else if (err) {
                return res.status(400).json("Error has occured.");
            }
            next();
        });
    };
}
exports.parseFile = parseFile;
