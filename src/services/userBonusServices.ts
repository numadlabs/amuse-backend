import { connections, io } from "../app";
import { CustomError } from "../exceptions/CustomError";
import { encryptionHelper } from "../lib/encryptionHelper";
import { bonusRepository } from "../repository/bonusRepository";
import { cardRepository } from "../repository/cardRepository";
import { employeeRepository } from "../repository/employeeRepository";
import { purchaseRepository } from "../repository/purchaseRepository";
import { restaurantRepository } from "../repository/restaurantRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { userRepository } from "../repository/userRepository";

export const userBonusServices = {
  buy: async (userId: string, restaurantId: string, bonusId: string) => {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new CustomError("No user found.", 400);

    const userCard = await userCardReposity.getByRestaurantId(
      restaurantId,
      userId
    );
    if (!userCard) throw new CustomError("No userCard found.", 400);
    if (userCard.userId !== userId)
      throw new CustomError("You are not allowed to buy from this card.", 400);

    const bonus = await bonusRepository.getById(bonusId);
    if (!bonus) throw new CustomError("No bonus found.", 400);

    if (
      bonus.type !== "REDEEMABLE" ||
      !bonus.price ||
      bonus.currentSupply >= bonus.totalSupply
    )
      throw new CustomError("This bonus cannot be purchased.", 400);

    if (user?.balance < bonus.price)
      throw new CustomError("Insufficient balance.", 400);

    if (userCard.cardId !== bonus.cardId)
      throw new CustomError("Invalid card, bonus relation.", 400);

    const reducePercentage = 1 - bonus.price / user.balance;
    await userCardReposity.reduceBalanceByUserId(user.id, reducePercentage);

    const userBonus = await userBonusRepository.create({
      userId: user.id,
      userCardId: userCard.id,
      bonusId: bonus.id,
    });

    user.balance -= bonus.price;
    await userRepository.update(user.id, user);

    const restaurant = await restaurantRepository.getById(restaurantId);
    restaurant.balance += bonus.price;
    restaurantRepository.update(restaurantId, restaurant);

    await purchaseRepository.create({ userBonusId: userBonus.id });
    bonus.currentSupply++;
    await bonusRepository.update(bonus, bonus.id);

    return userBonus;
  },
  generate: async (id: string, userId: string) => {
    const userBonus = await userBonusRepository.getById(id);
    if (!userBonus) throw new CustomError("Invalid userBonusId.", 400);
    if (userBonus.userId !== userId)
      throw new CustomError("You are not allowed to use it.", 400);

    const data = {
      userBonusId: userBonus.id,
      generatedAt: Date.now(),
    };

    const hashedData = encryptionHelper.encryptData(JSON.stringify(data));

    return hashedData;
  },
  use: async (encryptedData: string, waiterId: string) => {
    const data = encryptionHelper.decryptData(encryptedData);
    if (!data.userBonusId) throw new CustomError("Invalid QR.", 400);

    const userBonus = await userBonusRepository.getById(data.userBonusId);

    if (!userBonus)
      throw new CustomError("No corresponding userBonus found.", 400);

    if (userBonus.isUsed !== false)
      throw new CustomError("This bonus is used already.", 400);

    const waiter = await employeeRepository.getById(waiterId);
    if (!waiter) throw new CustomError("Waiter not found.", 400);

    const userCard = await userCardReposity.getById(userBonus.userCardId);
    if (!userCard) throw new CustomError("User card not found.", 400);

    const card = await cardRepository.getById(userCard.cardId);
    if (!waiter.restaurantId || card.restaurantId !== waiter.restaurantId)
      throw new CustomError(
        "Invalid waiter or you are not allowed to scan this bonus.",
        400
      );

    userBonus.isUsed = true;
    userBonus.usedAt = new Date();

    const updatedUserBonus = await userBonusRepository.update(
      userBonus.id,
      userBonus
    );

    const userSocketId = connections.get(userCard.userId);
    if (userSocketId)
      io.to(userSocketId).emit("bonus-scan", { bonus: updatedUserBonus });

    return updatedUserBonus;
  },
  getByRestaurantId: async (restaurantId: string, userId: string) => {
    const userBonuses = await userBonusRepository.getUserBonusesByRestaurantId(
      restaurantId,
      userId
    );

    const userCard = await userCardReposity.getByUserIdRestaurantId(
      userId,
      restaurantId
    );

    if (!userCard) throw new CustomError("No usercard found.", 400);

    const bonuses = await bonusRepository.getByRestaurantId(
      restaurantId,
      "RECURRING"
    );

    let followingBonus;
    if (bonuses.length > 0) {
      const restaurant = await restaurantRepository.getById(restaurantId);
      let index =
        Math.floor(userCard.visitCount / restaurant.perkOccurence) %
        bonuses.length;
      if (index + 1 === bonuses.length) index = 0;
      else index++;

      followingBonus = {
        id: bonuses[index].id,
        cardId: bonuses[index].cardId,
        name: bonuses[index].name,
        current: userCard.visitCount % restaurant.perkOccurence,
        target: restaurant.perkOccurence,
      };
    }

    return { userBonuses, followingBonus };
  },
  getByUserCardId: async (userCardId: string) => {
    const userCard = await userCardReposity.getById(userCardId);

    if (!userCard) throw new CustomError("No usercard found.", 400);

    const bonuses = await bonusRepository.getByCardId(
      userCard.cardId,
      "RECURRING"
    );
    const card = await cardRepository.getById(userCard.cardId);
    const restaurant = await restaurantRepository.getById(card.restaurantId);

    let followingBonus;
    if (bonuses.length > 0) {
      let index =
        Math.floor(userCard.visitCount / restaurant.perkOccurence) %
        bonuses.length;
      if (index + 1 === bonuses.length) index = 0;
      else index++;

      followingBonus = {
        id: bonuses[index].id,
        cardId: bonuses[index].cardId,
        name: bonuses[index].name,
        current: userCard.visitCount % restaurant.perkOccurence,
        target: restaurant.perkOccurence,
      };
    }

    const userBonuses = await userBonusRepository.getByUserCardId(userCardId);

    return { userBonuses, followingBonus };
  },
};
