import { Insertable } from "kysely";
import { encryptionHelper } from "../lib/encryptionHelper";
import { restaurantRepository } from "../repository/restaurantRepository";
import { tapRepository } from "../repository/tapRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { Tap, UserBonus } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { bonusRepository } from "../repository/bonusRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userRepository } from "../repository/userRepository";
import { currencyRepository } from "../repository/currencyRepository";
import { userTierRepository } from "../repository/userTierRepository";
import { employeeRepository } from "../repository/employeeRepository";
import { io, pubClient } from "../app";
import { transactionRepository } from "../repository/transactionRepository";
import { notificationRepository } from "../repository/notificationRepository";
import { db } from "../utils/db";
const crypto = require("crypto");

export const tapServices = {
  generate: async (userId: string) => {
    const data = {
      userId: userId,
      generatedAt: Date.now(),
    };

    const hashedData = encryptionHelper.encryptData(JSON.stringify(data));

    return hashedData;
  },
  redeemTap: async (hashedData: string, waiterId: string) => {
    const data = encryptionHelper.decryptData(hashedData);

    // if (Date.now() - data.issuedAt > TAP_EXPIRATION_TIME * 1000)
    //   throw new CustomError("The QR has expired.", 400);

    if (!data.userId) throw new CustomError("Invalid QR.", 400);
    const user = await userRepository.getUserById(data.userId);
    if (!user) throw new CustomError("Invalid QR.", 400);

    const waiter = await employeeRepository.getById(waiterId);
    if (!waiter || !waiter.restaurantId)
      throw new CustomError("Invalid employeeId.", 400);

    const restaurant = await restaurantRepository.getById(waiter.restaurantId);
    if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

    const userCard = await userCardReposity.getByUserIdRestaurantId(
      user.id,
      restaurant.id
    );

    const userSocketId = await pubClient.get(`socket:${user.id}`);
    if (!userCard) {
      if (userSocketId) {
        console.log(`Emitting tap-scan to ${userSocketId}`);
        io.to(userSocketId).emit("tap-scan", {
          isOwned: false,
          restaurantId: restaurant.id,
        });
      }

      throw new CustomError(
        "Customer does not have a membership card for this restaurant.",
        400
      );
    }

    const result = await db.transaction().execute(async (trx) => {
      userCard.visitCount += 1;

      //start of bonus logic
      const singleBonus = await bonusRepository.getByRestaurantIdAndVisitNo(
        restaurant.id,
        userCard.visitCount
      );
      let bonus = null;
      let hasRecurringBonus = true;

      if (!singleBonus) {
        const recurringBonuses = await bonusRepository.getByCardId(
          userCard.cardId,
          "RECURRING"
        );

        if (
          userCard.visitCount % restaurant.perkOccurence === 0 &&
          recurringBonuses.length === 0
        )
          hasRecurringBonus = false;

        if (
          (userCard.visitCount === 1 ||
            userCard.visitCount % restaurant.perkOccurence === 0) &&
          recurringBonuses.length > 0
        ) {
          const index =
            Math.floor(userCard.visitCount / restaurant.perkOccurence) %
            recurringBonuses.length;
          bonus = recurringBonuses[index];
          const userBonus: Insertable<UserBonus> = {
            bonusId: bonus.id,
            userId: user.id,
            userCardId: userCard.id,
          };

          await userBonusRepository.create(trx, userBonus);

          bonus.currentSupply++;
          await bonusRepository.update(trx, bonus, bonus.id);
        }
      } else {
        bonus = singleBonus;
        const userBonus: Insertable<UserBonus> = {
          bonusId: bonus.id,
          userId: user.id,
          userCardId: userCard.id,
        };

        await userBonusRepository.create(trx, userBonus);
        bonus.currentSupply++;
        await bonusRepository.update(trx, bonus, bonus.id);
      }

      const tier = await userTierRepository.getByIdWithNextTier(
        user.userTierId
      );

      const btc = await currencyRepository.getByTicker("BTC");
      const currency = await currencyRepository.getByTicker("EUR");

      let incrementBtc =
        (restaurant.rewardAmount / (btc.price * currency.price)) *
        tier.rewardMultiplier;

      // if (user.email && user.location && user.dateOfBirth)
      //   incrementBtc *= BOOST_MULTIPLIER;

      if (restaurant.balance >= incrementBtc) {
        restaurant.balance -= incrementBtc;
        restaurantRepository.update(trx, restaurant.id, restaurant);
        user.balance = user.balance + incrementBtc;

        await transactionRepository.create(trx, {
          userId: user.id,
          amount: incrementBtc,
          type: "PURCHASE",
          txid: crypto.randomBytes(16).toString("hex"),
        });
        userCard.balance += incrementBtc;
        await userCardReposity.update(trx, userCard, userCard.id);
      } else incrementBtc = 0;

      user.visitCount += 1;
      await userRepository.update(trx, user.id, user);

      const tapData: Insertable<Tap> = {
        userCardId: userCard.id,
        userId: user.id,
        amount: incrementBtc,
      };

      await tapRepository.create(trx, tapData);

      let updatedUserTier = null;
      if (
        tier.nextTierNo &&
        tier.nextTierId &&
        user.visitCount >= tier.nextTierNo
      ) {
        await userRepository.update(trx, user.id, {
          userTierId: tier.nextTierId,
        });
        updatedUserTier = await userTierRepository.getById(tier.nextTierId);
      }

      await notificationRepository.create(trx, {
        userId: user.id,
        message: `You have earned ${restaurant.rewardAmount} EUR from ${restaurant.name}`,
      });

      return {
        increment: incrementBtc * btc.price * currency.price,
        ticker: "EUR",
        bonus: bonus,
        userTier: updatedUserTier,
        bonusCheck: hasRecurringBonus,
      };
    });

    if (userSocketId) {
      console.log(`Emitting tap-scan to ${userSocketId}`);
      io.to(userSocketId).emit("tap-scan", {
        isOwned: true,
        data: {
          restaurantId: restaurant.id,
          increment: result.increment,
          ticker: "EUR",
          bonus: result.bonus,
          userTier: result.userTier,
          bonusCheck: result.bonusCheck,
        },
      });
    }

    return result;
  },
};
