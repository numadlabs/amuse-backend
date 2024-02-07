import { Restaurant } from "@prisma/client";
import { Updateable } from "kysely";
import { restaurantResposity } from "../repository/restaurantRepository";

export const restaurantServices = {
  update: async (id: string, data: Updateable<Restaurant>) => {
    const restaurant = await restaurantResposity.getById(id);
    if (!restaurant) throw new Error("No restaurant found with the given id");

    const updatedRestaurant = await restaurantResposity.update(
      restaurant.id,
      data
    );

    return updatedRestaurant;
  },
  delete: async (id: string) => {
    const restaurant = await restaurantResposity.getById(id);
    if (!restaurant) throw new Error("No restaurant found with the given id");

    const deletedRestaurant = await restaurantResposity.delete(restaurant.id);

    return deletedRestaurant;
  },
};
