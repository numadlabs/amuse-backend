import { CustomError } from "../exceptions/CustomError";
import { BONUS_REDEEM_EXPIRATION_TIME } from "../lib/constants";
import { encryptionHelper } from "../lib/encryptionHelper";
import { bonusRepository } from "../repository/bonusRepository";
import { cardRepository } from "../repository/cardRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userCardReposity } from "../repository/userCardRepository";

export const userBonusServices = {
  use: async (id: string, userId: string) => {
    /* 
        check if userBonus is authenticatedUsersOwn 
        check if userBonus is not used
    */
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

    const followingBonus = bonuses[index];

    return { userBonuses, followingBonus };
  },
};
