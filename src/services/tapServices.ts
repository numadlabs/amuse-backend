import { Insertable } from "kysely";
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
import { userCardServices } from "./userCardServices";

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
      throw new CustomError(
        "Please make sure you are added to a restaurant.",
        400
      );

    const userSocketId = await redis.get(`socket:${user.id}`);

    const restaurant = await restaurantRepository.getById(
      db,
      waiter.restaurantId
    );
    if (!restaurant) throw new CustomError("Invalid restaurantId.", 400);

    const currencies = await currencyRepository.getByTickerWithBtc("EUR");
    let incrementBtc =
      restaurant.rewardAmount / (currencies.btcPrice * currencies.tickerPrice); // * tier.rewardMultiplier;

    // if (user.email && user.countryId && user.birthMonth && user.birthYear)
    //   incrementBtc *= BOOST_MULTIPLIER;

    let userCard = await userCardServices.addIfNotExists(
      user.id,
      restaurant.id
    );

    // if (userSocketId) {
    //   io.to(userSocketId).emit("tap-scan", {
    //     isOwned: false,
    //     isInTapLock: false,
    //     data: {
    //       restaurantId: restaurant.id,
    //     },
    //   });

    //   logger.info(`Emitted tap-scan to socket ID of ${userSocketId}`);
    // }

    // throw new CustomError(
    //   "Customer does not have a membership card for this restaurant.",
    //   400
    // );

    const notifications: Insertable<Notification>[] = [];
    const result = await db.transaction().execute(async (trx) => {
      try {
        await userRepository.acquireLockById(trx, user.id);
      } catch (error) {
        if (error instanceof DatabaseError && error.code === "55P03") {
          throw new CustomError(
            "Previous request is currently being processed. Please try again in a few moments.",
            409
          );
        }

        throw error;
      }

      const tapCheck = await tapRepository.getLatestTapByUserId(trx, user.id);
      if (tapCheck) {
        const currentTime = new Date();
        const timeDifference =
          currentTime.getTime() - tapCheck.tappedAt.getTime();

        if (timeDifference < TAP_LOCK_TIME * 1000 * 60 * 60) {
          if (userSocketId)
            io.to(userSocketId).emit("tap-scan", {
              isOwned: true,
              isInTapLock: true,
              data: {
                tapId: tapCheck.id,
                tappedAt: tapCheck.tappedAt,
                restaurantId: restaurant.id,
              },
            });

          throw new CustomError(
            `The user has already checked in today. Please note that they must wait ${TAP_LOCK_TIME} hours from their last check-in before checking in again.`,
            400
          );
        }
      }
      //start of bonus logic
      let bonus = null;
      let hasRecurringBonus = true;
      const availableBonuses =
        await bonusRepository.getAvailableBonusesByCardId(trx, userCard.cardId);
      if (availableBonuses.length > 0) {
        const singleBonus = await bonusRepository.getByRestaurantIdAndVisitNo(
          trx,
          restaurant.id,
          userCard.visitCount
        );

        if (!singleBonus) {
          const recurringBonuses = await bonusRepository.getByCardId(
            trx,
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

            await Promise.all([
              await userBonusRepository.create(trx, userBonus),
              await bonusRepository.incrementCurrentSupplyById(trx, bonus.id),
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

          await Promise.all([
            await userBonusRepository.create(trx, userBonus),
            await bonusRepository.incrementCurrentSupplyById(trx, bonus.id),
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
        await restaurantRepository.decrementBalanceById(
          trx,
          restaurant.id,
          incrementBtc
        );
        user.balance = user.balance + incrementBtc;
        userCard.balance += incrementBtc;
      } else incrementBtc = 0;

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

      user.visitCount += 1;
      const tapData: Insertable<Tap> = {
        userCardId: userCard.id,
        userId: user.id,
        amount: incrementBtc,
        employeeId: waiter.id,
      };

      await Promise.all([
        userRepository.update(trx, user.id, user),
        tapRepository.create(trx, tapData),
      ]);

      let updatedUserTier = null;
      // if (
      //   tier.nextTierNo &&
      //   tier.nextTierId &&
      //   user.visitCount >= tier.nextTierNo
      // ) {
      //   const result = await Promise.all([
      //     userRepository.update(trx, user.id, {
      //       userTierId: tier.nextTierId,
      //     }),
      //     userTierRepository.getById(tier.nextTierId),
      //   ]);

      //   updatedUserTier = result[1];
      // }

      return {
        increment: incrementBtc * currencies.btcPrice * currencies.tickerPrice,
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
        isInTapLock: false,
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
