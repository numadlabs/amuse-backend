import { CustomError } from "../exceptions/CustomError";
import { BONUS_REDEEM_EXPIRATION_TIME } from "../lib/constants";
import { encryptionHelper } from "../lib/encryptionHelper";
import { bonusRepository } from "../repository/bonusRepository";
import { cardRepository } from "../repository/cardRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { userRepository } from "../repository/userRepository";
import { Bonus } from "../types/db/types";

type followingBonus = {
  id: string;
  imageUrl: string | null;
  name: string;
  cardId: string | null;
  price: number;
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

    return userBonus;
  },
  use: async (id: string, userId: string) => {
    const userBonus = await userBonusRepository.getById(id);

    if (!userBonus)
      throw new CustomError("No corresponding userBonus found.", 400);

    if (userBonus?.userId !== userId)
      throw new CustomError("You are not allowed to use this bonus.", 400);

    if (userBonus.isUsed)
      throw new CustomError("This bonus is used already.", 400);

    const data = {
      userBonusId: userBonus.id,
      issuedAt: Date.now(),
    };

    const encryptedData = encryptionHelper.encryptData(JSON.stringify(data));

    return encryptedData;
  },
  redeem: async (encryptedData: string) => {
    const data = encryptionHelper.decryptData(encryptedData);

    if (Date.now() - data.issuedAt > BONUS_REDEEM_EXPIRATION_TIME * 1000)
      throw new CustomError("The QR has expired.", 400);

    const userBonusId: string = data.userBonusId;

    const userBonus = await userBonusRepository.getById(userBonusId);
    if (!userBonus) throw new CustomError("Invalid userBonus.", 400);

    userBonus.isUsed = true;

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
    let index = Math.floor(userCard.visitCount / 3) % bonuses.length;
    if (index + 1 === bonuses.length) index = 0;
    else index++;

    const followingBonus: followingBonus = {
      id: bonuses[index].id,
      cardId: bonuses[index].cardId,
      imageUrl: bonuses[index].imageUrl,
      name: bonuses[index].name,
      price: bonuses[index].price,
      current: userCard.visitCount % 3,
      target: 3,
    };

    return { userBonuses, followingBonus };
  },
  getByUserCardId: async (userCardId: string) => {
    const userCard = await userCardReposity.getById(userCardId);

    if (!userCard) throw new CustomError("No usercard found.", 400);

    const bonuses = await bonusRepository.getByCardId(userCard.cardId);
    let index = Math.floor(userCard.visitCount / 3) % bonuses.length;
    if (index + 1 === bonuses.length) index = 0;
    else index++;

    const followingBonus: followingBonus = {
      id: bonuses[index].id,
      cardId: bonuses[index].cardId,
      imageUrl: bonuses[index].imageUrl,
      name: bonuses[index].name,
      price: bonuses[index].price,
      current: userCard.visitCount % 3,
      target: 3,
    };

    const userBonuses = await userBonusRepository.getByUserCardId(userCardId);

    return { userBonuses, followingBonus };
  },
};
