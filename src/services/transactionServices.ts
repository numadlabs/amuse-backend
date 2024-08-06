import { Insertable } from "kysely";
import { Transaction } from "../types/db/types";
import { transactionRepository } from "../repository/transactionRepository";
import { restaurantRepository } from "../repository/restaurantRepository";
import { CustomError } from "../exceptions/CustomError";
import { userRepository } from "../repository/userRepository";
import { currencyRepository } from "../repository/currencyRepository";
import { userCardReposity } from "../repository/userCardRepository";

export const transactionServices = {
  deposit: async (data: Insertable<Transaction>) => {
    const eur = await currencyRepository.getByTicker("EUR");
    const bitcoin = await currencyRepository.getByTicker("BTC");
    //converting the amount to bitcoin
    const amount = data.amount / (bitcoin.price * eur.price);

    if (data.restaurantId) {
      const restaurant = await restaurantRepository.getById(data.restaurantId);
      if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

      restaurant.balance += amount;
      await restaurantRepository.update(restaurant.id, restaurant);
    }

    if (data.userId) {
      const user = await userRepository.getUserById(data.userId);
      if (!user) throw new CustomError("Invalid userId.", 400);

      user.balance += amount;
      await userRepository.update(data.userId, user);
    }

    data.type = "DEPOSIT";
    data.amount = amount;
    const transaction = await transactionRepository.create(data);

    return transaction;
  },
  withdraw: async (data: Insertable<Transaction>) => {
    const eur = await currencyRepository.getByTicker("EUR");
    const bitcoin = await currencyRepository.getByTicker("BTC");
    const amount = data.amount / (bitcoin.price * eur.price);

    if (data.restaurantId) {
      const restaurant = await restaurantRepository.getById(data.restaurantId);
      if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);
      if (restaurant.balance < amount)
        throw new CustomError("Insufficient balance.", 400);

      restaurant.balance -= amount;
      await restaurantRepository.update(restaurant.id, restaurant);
    }

    if (data.userId) {
      const user = await userRepository.getUserById(data.userId);
      if (!user) throw new CustomError("Invalid userId.", 400);
      if (user.balance < amount)
        throw new CustomError("Insufficient balance.", 400);

      const reducePercentage = Math.ceil((amount / user.balance) * 100);
      user.balance -= amount;
      await userRepository.update(data.userId, user);

      await userCardReposity.reduceBalanceByUserId(user.id, reducePercentage);
    }

    data.type = "WITHDRAW";
    data.amount = amount;
    const transaction = await transactionRepository.create(data);

    return transaction;
  },
};
