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

    //if firstTap field is false
    /* if (!userCard.isFirstTap) {
      const bonus = await bonusRepository.getFirstTapBonus();

      const userBonus: Insertable<UserBonus> = {
        bonusId: bonus.id,
        userId: userId,
        userCardId: userCard.id,
      };

      await userBonusRepository.create(userBonus);
    } */

    const bonus = await bonusRepository.getFirstTapBonus();

    const userBonus: Insertable<UserBonus> = {
      bonusId: bonus.id,
      userId: userId,
      userCardId: userCard.id,
    };

    await userBonusRepository.create(userBonus);

    userCard.isFirstTap = true;
    userCard.visitCount += 1;

    //user balance increment
    user.balance = user.balance + 0.0012;

    await userRepository.update(user.id, user);
    await userCardReposity.update(userCard, userCard.id);

    const tapData: Insertable<Tap> = {
      userCardId: userCard.id,
      userId: userId,
    };

    const tap = await tapRepository.create(tapData);

    return { tap: tap, increment: 0.0012, bonus: bonus };
  },
};
