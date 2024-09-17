import { Insertable, sql } from "kysely";
import { encryptionHelper } from "../lib/encryptionHelper";
import { restaurantRepository } from "../repository/restaurantRepository";
import { tapRepository } from "../repository/tapRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { Notification, Tap, UserBonus } from "../types/db/types";
import { CustomError } from "../exceptions/CustomError";
import { bonusRepository } from "../repository/bonusRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userRepository } from "../repository/userRepository";
import { currencyRepository } from "../repository/currencyRepository";
import { userTierRepository } from "../repository/userTierRepository";
import { employeeRepository } from "../repository/employeeRepository";
import { transactionRepository } from "../repository/transactionRepository";
import { notificationRepository } from "../repository/notificationRepository";
import { db } from "../utils/db";
import {
  BOOST_MULTIPLIER,
  TAP_EXPIRATION_TIME,
  TAP_LOCK_TIME,
} from "../lib/constants";
import logger from "../config/winston";
import { io, redis } from "../server";
import { DatabaseError } from "pg";

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

    if (!data || !data.userId || !data.generatedAt)
      throw new CustomError("Invalid QR.", 400);

    if (Date.now() - data.generatedAt > TAP_EXPIRATION_TIME * 1000)
      throw new CustomError("The QR has expired.", 400);

    const [user, waiter] = await Promise.all([
      userRepository.getUserById(data.userId),
      employeeRepository.getById(waiterId),
    ]);

    if (!user) throw new CustomError("Invalid userId.", 400);
    if (!waiter || !waiter.restaurantId)
      throw new CustomError("Invalid employeeId.", 400);

    const userSocketId = await redis.get(`socket:${user.id}`);

    const restaurant = await restaurantRepository.getById(waiter.restaurantId);
    if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

    const userCard = await userCardReposity.getByUserIdRestaurantId(
      user.id,
      restaurant.id
    );

    if (!userCard) {
      if (userSocketId) {
        io.to(userSocketId).emit("tap-scan", {
          isOwned: false,
          restaurantId: restaurant.id,
        });

        logger.info(`Emitted tap-scan to socket ID of ${userSocketId}`);
      }

      throw new CustomError(
        "Customer does not have a membership card for this restaurant.",
        400
      );
    }

    const notifications: Insertable<Notification>[] = [];
    const result = await db.transaction().execute(async (trx) => {
      try {
        await userRepository.acquireLockById(trx, user.id);
      } catch (error) {
        if (error instanceof DatabaseError && error.code === "55P03") {
          throw new CustomError(
            "This user's data is currently being processed. Please try again in a few moments.",
            409
          );
        }

        throw error;
      }

      const tapCheck = await tapRepository.getLatestTapByUserId(user.id);
      if (tapCheck) {
        const currentTime = new Date();
        const timeDifference =
          currentTime.getTime() - tapCheck.tappedAt.getTime();

        if (timeDifference < TAP_LOCK_TIME * 1000 * 60 * 60) {
          if (userSocketId)
            io.to(userSocketId).emit("tap-scan", {
              isInTapLock: false,
              tapId: tapCheck.id,
            });

          throw new CustomError(
            `Please wait ${TAP_LOCK_TIME} hours before scanning again.`,
            400
          );
        }
      }
      //start of bonus logic
      let bonus = null;
      let hasRecurringBonus = true;
      const availableBonuses =
        await bonusRepository.getAvailableBonusesByCardId(userCard.cardId);
      if (availableBonuses.length > 0) {
        const singleBonus = await bonusRepository.getByRestaurantIdAndVisitNo(
          restaurant.id,
          userCard.visitCount
        );

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
            bonus.currentSupply++;

            await Promise.all([
              await userBonusRepository.create(trx, userBonus),
              await bonusRepository.update(trx, bonus, bonus.id),
            ]);
            notifications.push({
              userId: user.id,
              message: `You earned perk of ${restaurant.name}.`,
              type: "BONUS",
            });
          }
        } else {
          bonus = singleBonus;
          const userBonus: Insertable<UserBonus> = {
            bonusId: bonus.id,
            userId: user.id,
            userCardId: userCard.id,
          };
          bonus.currentSupply++;

          await Promise.all([
            await userBonusRepository.create(trx, userBonus),
            await bonusRepository.update(trx, bonus, bonus.id),
          ]);

          notifications.push({
            userId: user.id,
            message: `You earned perk of ${restaurant.name}.`,
            type: "BONUS",
          });
        }
      }

      //start of reward logic
      userCard.visitCount += 1;

      const [tier, btc, currency] = await Promise.all([
        userTierRepository.getByIdWithNextTier(user.userTierId),
        currencyRepository.getByTicker("BTC"),
        currencyRepository.getByTicker("EUR"),
      ]);

      let incrementBtc =
        (restaurant.rewardAmount / (btc.price * currency.price)) *
        tier.rewardMultiplier;

      if (user.email && user.countryId && user.birthMonth && user.birthYear)
        incrementBtc *= BOOST_MULTIPLIER;

      notifications.push({
        userId: user.id,
        message: `You checked-in at ${restaurant.name}.`,
        type: "TAP",
      });
      notifications.push({
        employeeId: waiter.id,
        message: `You scanned QR of user ${user.email}.`,
        type: "TAP",
      });

      if (restaurant.balance >= incrementBtc) {
        restaurant.balance -= incrementBtc;
        restaurantRepository.update(trx, restaurant.id, restaurant);
        user.balance = user.balance + incrementBtc;
        userCard.balance += incrementBtc;

        await Promise.all([
          transactionRepository.create(trx, {
            userId: user.id,
            amount: incrementBtc,
            type: "REWARD",
            txid: crypto.randomBytes(16).toString("hex"),
          }),
          userCardReposity.update(trx, userCard, userCard.id),
        ]);

        notifications.push({
          userId: user.id,
          message: `You got €${restaurant.rewardAmount} of Bitcoin.`,
          type: "REWARD",
        });
      } else incrementBtc = 0;

      user.visitCount += 1;
      const tapData: Insertable<Tap> = {
        userCardId: userCard.id,
        userId: user.id,
        amount: incrementBtc,
      };

      await Promise.all([
        userRepository.update(trx, user.id, user),
        tapRepository.create(trx, tapData),
      ]);

      let updatedUserTier = null;
      if (
        tier.nextTierNo &&
        tier.nextTierId &&
        user.visitCount >= tier.nextTierNo
      ) {
        const result = await Promise.all([
          userRepository.update(trx, user.id, {
            userTierId: tier.nextTierId,
          }),
          userTierRepository.getById(tier.nextTierId),
        ]);

        updatedUserTier = result[1];
      }

      return {
        increment: incrementBtc * btc.price * currency.price,
        ticker: "EUR",
        bonus: bonus,
        userTier: updatedUserTier,
        bonusCheck: hasRecurringBonus,
      };
    });

    if (notifications.length > 0)
      notificationRepository.createInBatch(notifications);

    if (userSocketId) {
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

      logger.info(`Emitted tap-scan to socket ID of ${userSocketId}`);
    }

    return result;
  },
};
