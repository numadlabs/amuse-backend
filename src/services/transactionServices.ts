import { Insertable } from "kysely";
import { Transaction } from "../types/db/types";
import { transactionRepository } from "../repository/transactionRepository";
import { restaurantRepository } from "../repository/restaurantRepository";
import { CustomError } from "../exceptions/CustomError";
import { userRepository } from "../repository/userRepository";

export const transactionServices = {
  deposit: async (data: Insertable<Transaction>) => {
    if (data.restaurantId) {
      const restaurant = await restaurantRepository.getById(data.restaurantId);
      if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

      restaurant.balance += data.amount;
      await restaurantRepository.update(restaurant.id, restaurant);
    }

    if (data.userId) {
      const user = await userRepository.getUserById(data.userId);
      if (!user) throw new CustomError("Invalid userId.", 400);

      user.balance += data.amount;
      await userRepository.update(data.userId, user);
    }

    data.type = "DEPOSIT";
    const transaction = await transactionRepository.create(data);

    return transaction;
  },
  withdraw: async (data: Insertable<Transaction>) => {
    if (data.restaurantId) {
      const restaurant = await restaurantRepository.getById(data.restaurantId);
      if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);
      if (restaurant.balance < data.amount)
        throw new CustomError("Insufficient balance.", 400);

      restaurant.balance -= data.amount;
      await restaurantRepository.update(restaurant.id, restaurant);
    }

    if (data.userId) {
      const user = await userRepository.getUserById(data.userId);
      if (!user) throw new CustomError("Invalid userId.", 400);
      if (user.balance < data.amount)
        throw new CustomError("Insufficient balance.", 400);

      user.balance -= data.amount;
      await userRepository.update(data.userId, user);
    }

    data.type = "WITHDRAW";
    const transaction = await transactionRepository.create(data);

    return transaction;
  },
};
