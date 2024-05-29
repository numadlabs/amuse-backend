import { Insertable } from "kysely";
import { encryptionHelper } from "../lib/encryptionHelper";
import { restaurantRepository } from "../repository/restaurantRepository";
import { tapRepository } from "../repository/tapRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { Tap, UserBonus } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { TAP_EXPIRATION_TIME } from "../lib/constants";
import { bonusRepository } from "../repository/bonusRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userRepository } from "../repository/userRepository";
import { currencyRepository } from "../repository/currencyRepository";

export const tapServices = {
  generateTap: async (restaurantId: string) => {
    const restaurant = await restaurantRepository.getById(restaurantId);

    if (!restaurant) throw new CustomError("Invalid restaurantId", 400);

    const data = {
      restaurantId: restaurantId,
      issuedAt: Date.now(),
    };

    const hashedData = encryptionHelper.encryptData(JSON.stringify(data));

    return hashedData;
  },
  verifyTap: async (hashedData: string, userId: string) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new CustomError("Invalid user.", 400);

    const data = encryptionHelper.decryptData(hashedData);

    if (Date.now() - data.issuedAt > TAP_EXPIRATION_TIME * 1000)
      throw new CustomError("The QR has expired.", 400);

    const restaurant = await restaurantRepository.getById(data.restaurantId);
    if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

    const userCard = await userCardReposity.getByUserIdRestaurantId(
      userId,
      data.restaurantId
    );

    if (!userCard) return { isOwned: false, userCard };

    return { isOwned: true, userCard };
  },
  redeemTap: async (hashedData: string, userId: string) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new CustomError("Invalid user.", 400);

    const data = encryptionHelper.decryptData(hashedData);

    if (Date.now() - data.issuedAt > TAP_EXPIRATION_TIME * 1000)
      throw new CustomError("The QR has expired.", 400);

    const restaurant = await restaurantRepository.getById(data.restaurantId);
    if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

    const userCard = await userCardReposity.getByUserIdRestaurantId(
      userId,
      data.restaurantId
    );

    if (!userCard)
      throw new CustomError(
        "You do not have membership card for this restaurant.",
        400
      );

    userCard.isFirstTap = true;

    const bonuses = await bonusRepository.getByCardId(userCard.cardId);
    let bonus;

    if (userCard.visitCount === 0) {
      const index = Math.floor(userCard.visitCount / 3) % bonuses.length;
      bonus = bonuses[index];

      const userBonus: Insertable<UserBonus> = {
        bonusId: bonus.id,
        userId: userId,
        userCardId: userCard.id,
      };

      await userBonusRepository.create(userBonus);
    }

    userCard.visitCount += 1;
    if (userCard.visitCount % 3 === 0) {
      const index = Math.floor(userCard.visitCount / 3) % bonuses.length;
      bonus = bonuses[index];

      const userBonus: Insertable<UserBonus> = {
        bonusId: bonus.id,
        userId: userId,
        userCardId: userCard.id,
      };

      await userBonusRepository.create(userBonus);
    }

    const btc = await currencyRepository.getByName("Bitcoin");
    const incrementBtc = 1 / (btc.price * 3.67);

    if (restaurant.balance >= incrementBtc) {
      restaurant.balance -= incrementBtc;
      restaurant.givenOut += incrementBtc;
      restaurantRepository.update(restaurant.id, restaurant);
    }

    user.balance = user.balance + incrementBtc;

    await userRepository.update(user.id, user);
    await userCardReposity.update(userCard, userCard.id);

    const tapData: Insertable<Tap> = {
      userCardId: userCard.id,
      userId: userId,
    };

    const tap = await tapRepository.create(tapData);

    return { tap: tap, increment: incrementBtc, bonus: bonus };
  },
};
