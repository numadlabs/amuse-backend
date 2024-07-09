import { CustomError } from "../exceptions/CustomError";
import { BONUS_REDEEM_EXPIRATION_TIME } from "../lib/constants";
import { encryptionHelper } from "../lib/encryptionHelper";
import { bonusRepository } from "../repository/bonusRepository";
import { cardRepository } from "../repository/cardRepository";
import { purchaseRepository } from "../repository/purchaseRepository";
import { restaurantRepository } from "../repository/restaurantRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { userRepository } from "../repository/userRepository";
import { Purchase } from "../types/db/types";

type followingBonus = {
  id: string;
  imageUrl: string | null;
  name: string;
  cardId: string | null;
  current: number;
  target: number;
};

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

    if (bonus.type !== "REDEEMABLE" || !bonus.price)
      throw new CustomError("This bonus cannot be purchased.", 400);

    if (user?.balance < bonus.price)
      throw new CustomError("Insufficient balance.", 400);

    if (userCard.cardId !== bonus.cardId)
      throw new CustomError("Invalid card, bonus relation.", 400);

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

    return userBonus;
  },
  use: async (id: string, userId: string) => {
    const userBonus = await userBonusRepository.getById(id);

    if (!userBonus)
      throw new CustomError("No corresponding userBonus found.", 400);

    if (userBonus?.userId !== userId)
      throw new CustomError("You are not allowed to use this bonus.", 400);

    if (userBonus.status !== "UNUSED")
      throw new CustomError("This bonus is used already.", 400);

    const userCard = await userCardReposity.getById(userBonus.userCardId);
    if (!userCard) throw new CustomError("User card not found.", 400);

    const card = await cardRepository.getById(userCard.cardId);

    const data = {
      restaurantId: card.restaurantId,
    };

    const encryptedData = encryptionHelper.encryptData(JSON.stringify(data));

    return encryptedData;
  },
  redeem: async (id: string, encryptedData: string) => {
    const data = encryptionHelper.decryptData(encryptedData);
    const restaurantId = data.restaurantId;

    // if (Date.now() - data.issuedAt > BONUS_REDEEM_EXPIRATION_TIME * 1000)
    //   throw new CustomError("The QR has expired.", 400);

    const userBonus = await userBonusRepository.getById(id);
    if (!userBonus || userBonus.status !== "UNUSED")
      throw new CustomError("Invalid userBonus.", 400);

    const restaurant = await restaurantRepository.getById(restaurantId);
    if (!restaurant) throw new CustomError("Invalid restaurant.", 400);

    const userCard = await userCardReposity.getById(userBonus.userCardId);
    if (!userCard) throw new CustomError("User card not found.", 400);

    const card = await cardRepository.getById(userCard.cardId);
    if (card.restaurantId !== restaurantId)
      throw new CustomError(
        "Input and userCard restaurantId does not match.",
        400
      );

    userBonus.status = "USED";

    const updatedUserBonus = await userBonusRepository.update(
      userBonus.id,
      userBonus
    );

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

    const bonuses = await bonusRepository.getByRestaurantId(restaurantId);

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
        imageUrl: bonuses[index].imageUrl,
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

    const bonuses = await bonusRepository.getByCardId(userCard.cardId);
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
        imageUrl: bonuses[index].imageUrl,
        name: bonuses[index].name,
        current: userCard.visitCount % restaurant.perkOccurence,
        target: restaurant.perkOccurence,
      };
    }

    const userBonuses = await userBonusRepository.getByUserCardId(userCardId);

    return { userBonuses, followingBonus };
  },
};
