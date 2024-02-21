import { Restaurant } from "@prisma/client";
import { Updateable } from "kysely";
import { restaurantRepository } from "../repository/restaurantRepository";
import { CustomError } from "../exceptions/CustomError";

export const restaurantServices = {
  update: async (id: string, data: Updateable<Restaurant>) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);

    const updatedRestaurant = await restaurantRepository.update(
      restaurant.id,
      data
    );

    return updatedRestaurant;
  },
  delete: async (id: string) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant)
      throw new CustomError("No restaurant found with the given id.", 400);

    const deletedRestaurant = await restaurantRepository.delete(restaurant.id);

    return deletedRestaurant;
  },
};
