import { Insertable } from "kysely";
import { encryptionHelper } from "../lib/encryptionHelper";
import { restaurantRepository } from "../repository/restaurantRepository";
import { tapRepository } from "../repository/tapRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { Tap, UserBonus } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { BOOST_MULTIPLIER, TAP_EXPIRATION_TIME } from "../lib/constants";
import { bonusRepository } from "../repository/bonusRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userRepository } from "../repository/userRepository";
import { currencyRepository } from "../repository/currencyRepository";
import { userTierRepository } from "../repository/userTierRepository";
import { employeeRepository } from "../repository/employeeRepository";

export const tapServices = {
  verifyTap: async (hashedData: string, userId: string) => {
    const user = await userRepository.getUserById(userId);

    if (!user) throw new CustomError("Invalid user.", 400);

    const data = encryptionHelper.decryptData(hashedData);

    /* if (Date.now() - data.issuedAt > TAP_EXPIRATION_TIME * 1000)
      throw new CustomError("The QR has expired.", 400); */

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
    const data = encryptionHelper.decryptData(hashedData);

    const restaurant = await restaurantRepository.getById(data.restaurantId);
    if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

    // if (Date.now() - data.issuedAt > TAP_EXPIRATION_TIME * 1000)
    //   throw new CustomError("The QR has expired.", 400);

    const user = await userRepository.getUserById(userId);
    if (!user) throw new CustomError("Invalid userId.", 400);

    const userCard = await userCardReposity.getByUserIdRestaurantId(
      user.id,
      restaurant.id
    );

    if (!userCard)
      throw new CustomError(
        "Customer does not have a membership card for this restaurant.",
        400
      );

    userCard.isFirstTap = true;

    const bonuses = await bonusRepository.getByCardId(userCard.cardId);
    let bonus;

    if (bonuses.length === 0) bonus = "Ran out of perks.";

    if (userCard.visitCount === 0 && bonuses.length > 0) {
      const index =
        Math.floor(userCard.visitCount / restaurant.perkOccurence) %
        bonuses.length;
      bonus = bonuses[index];

      const userBonus: Insertable<UserBonus> = {
        bonusId: bonus.id,
        userId: user.id,
        userCardId: userCard.id,
      };

      await userBonusRepository.create(userBonus);

      bonus.currentSupply++;
      await bonusRepository.update(bonus, bonus.id);
    }

    userCard.visitCount += 1;

    if (
      userCard.visitCount % restaurant.perkOccurence === 0 &&
      bonuses.length > 0
    ) {
      const index =
        Math.floor(userCard.visitCount / restaurant.perkOccurence) %
        bonuses.length;
      bonus = bonuses[index];

      const userBonus: Insertable<UserBonus> = {
        bonusId: bonus.id,
        userId: user.id,
        userCardId: userCard.id,
      };

      await userBonusRepository.create(userBonus);

      bonus.currentSupply++;
      await bonusRepository.update(bonus, bonus.id);
    }

    const tier = await userTierRepository.getByIdWithNextTier(user.userTierId);

    const btc = await currencyRepository.getByTicker("BTC");
    const currency = await currencyRepository.getByTicker("EUR");

    let incrementBtc =
      (restaurant.rewardAmount / (btc.currentPrice * currency.currentPrice)) *
      tier.rewardMultiplier;

    if (user.email && user.location && user.dateOfBirth)
      incrementBtc *= BOOST_MULTIPLIER;

    if (restaurant.balance >= incrementBtc) {
      restaurant.balance -= incrementBtc;
      restaurantRepository.update(restaurant.id, restaurant);
      user.balance = user.balance + incrementBtc;
    } else incrementBtc = 0;

    user.visitCount += 1;
    await userRepository.update(user.id, user);
    await userCardReposity.update(userCard, userCard.id);

    const tapData: Insertable<Tap> = {
      userCardId: userCard.id,
      userId: user.id,
      amount: incrementBtc,
    };

    const tap = await tapRepository.create(tapData);

    let updatedUserTier;
    if (tier.nextTierNo && tier.nextTierId)
      if (user.visitCount >= tier.nextTierNo) {
        await userRepository.update(user.id, { userTierId: tier.nextTierId });
        updatedUserTier = await userTierRepository.getById(tier.nextTierId);
      }

    return {
      tap: tap,
      increment: incrementBtc.toFixed(8),
      bonus: bonus,
      userTier: updatedUserTier,
    };
  },
};
