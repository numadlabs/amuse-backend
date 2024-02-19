import { Restaurant } from "@prisma/client";
import { Updateable } from "kysely";
import { restaurantRepository } from "../repository/restaurantRepository";

export const restaurantServices = {
  update: async (id: string, data: Updateable<Restaurant>) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant) throw new Error("No restaurant found with the given id");

    const updatedRestaurant = await restaurantRepository.update(
      restaurant.id,
      data
    );

    return updatedRestaurant;
  },
  delete: async (id: string) => {
    const restaurant = await restaurantRepository.getById(id);
    if (!restaurant) throw new Error("No restaurant found with the given id");

    const deletedRestaurant = await restaurantRepository.delete(restaurant.id);

    return deletedRestaurant;
  },
};
