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
exports.restaurantServices = void 0;
const restaurantRepository_1 = require("../repository/restaurantRepository");
const CustomError_1 = require("../exceptions/CustomError");
const aws_1 = require("../utils/aws");
const constants_1 = require("../lib/constants");
const crypto_1 = require("crypto");
exports.restaurantServices = {
    create: (data, file) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield restaurantRepository_1.restaurantRepository.create(data);
        if (!file)
            return restaurant;
        const s3Response = yield aws_1.s3
            .upload({
            Bucket: constants_1.s3BucketName,
            Key: (0, crypto_1.randomUUID)(),
            Body: file.buffer,
            ContentType: file.mimetype,
        })
            .promise();
        restaurant.logo = s3Response.Key;
        const updatedRestaurant = yield restaurantRepository_1.restaurantRepository.update(restaurant.id, restaurant);
        return updatedRestaurant;
    }),
    update: (id, data, file) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield restaurantRepository_1.restaurantRepository.getById(id);
        if (!restaurant)
            throw new CustomError_1.CustomError("No restaurant found with the given id.", 400);
        if (file && restaurant.logo) {
            yield aws_1.s3
                .deleteObject({ Bucket: constants_1.s3BucketName, Key: restaurant.logo })
                .promise();
        }
        if (file) {
            const s3Response = yield aws_1.s3
                .upload({
                Bucket: constants_1.s3BucketName,
                Key: (0, crypto_1.randomUUID)(),
                Body: file.buffer,
                ContentType: file.mimetype,
            })
                .promise();
            data.logo = s3Response.Key;
        }
        const updatedRestaurant = yield restaurantRepository_1.restaurantRepository.update(restaurant.id, data);
        return updatedRestaurant;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const restaurant = yield restaurantRepository_1.restaurantRepository.getById(id);
        if (!restaurant)
            throw new CustomError_1.CustomError("No restaurant found with the given id.", 400);
        const deletedRestaurant = yield restaurantRepository_1.restaurantRepository.delete(restaurant.id);
        return deletedRestaurant;
    }),
};
