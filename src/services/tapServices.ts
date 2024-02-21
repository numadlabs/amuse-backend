import { Insertable } from "kysely";
import { encryptionHelper } from "../lib/encryptionHelper";
import { restaurantRepository } from "../repository/restaurantRepository";
import { tapRepository } from "../repository/tapRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { Tap } from "../types/db/types";

export const tapServices = {
  generateTap: async (restaurantId: string) => {
    const restaurant = await restaurantRepository.getById(restaurantId);

    if (!restaurant) throw new Error("Invalid restaurantId");

    const data = {
      restaurantId: restaurantId,
      issuedAt: Date.now(),
    };

    const hashedData = encryptionHelper.encryptData(JSON.stringify(data));

    return hashedData;
  },
  redeemTap: async (hashedData: string, userId: string) => {
    const data = encryptionHelper.decryptData(hashedData);

    if (Date.now() - data.issuedAt > 300000) throw new Error("Expired QR");

    const restaurant = await restaurantRepository.getById(data.restaurantId);
    if (!restaurant) throw new Error("Invalid restaurantId.");

    const userCard = await userCardReposity.getByUserIdRestaurantId(
      userId,
      data.restaurantId
    );

    if (!userCard)
      throw new Error("You do not have membership card for this restaurant.");

    const tapData: Insertable<Tap> = {
      userCardId: userCard.id,
      userId: userId,
    };

    const tap = await tapRepository.create(tapData);

    return tap;
  },
};
