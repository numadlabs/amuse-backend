"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("../middlewares/authenticateToken");
const restaurantController_1 = require("../controllers/restaurantController");
const authorization_1 = require("../middlewares/authorization");
const fileParser_1 = require("../middlewares/fileParser");
const restaurantRoutes = express_1.default.Router();
restaurantRoutes.post("/", authenticateToken_1.authenticateToken, 
/* authorize("SUPER_ADMIN"), */
(0, fileParser_1.parseFile)("logo"), restaurantController_1.restaurantController.createRestaurant);
restaurantRoutes.get("/", authenticateToken_1.authenticateToken, restaurantController_1.restaurantController.getRestaurants);
restaurantRoutes.get("/:id", restaurantController_1.restaurantController.getRestaurantById);
restaurantRoutes.put("/:id", authenticateToken_1.authenticateToken, 
/* authorize("SUPER_ADMIN", "ADMIN"), */
(0, fileParser_1.parseFile)("logo"), restaurantController_1.restaurantController.updateRestaurant);
restaurantRoutes.delete("/:id", authenticateToken_1.authenticateToken, (0, authorization_1.authorize)("ADMIN"), restaurantController_1.restaurantController.deleteRestaurant);
module.exports = restaurantRoutes;
