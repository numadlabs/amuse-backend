import { cardRepository } from "../repository/cardRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { CustomError } from "../exceptions/CustomError";
import { restaurantRepository } from "../repository/restaurantRepository";
import { notificationRepository } from "../repository/notificationRepository";
import { db } from "../utils/db";

export const userCardServices = {
  buy: async (userId: string, cardId: string) => {
    const isValidCard = await cardRepository.getById(cardId);
    if (!isValidCard) throw new CustomError("Invalid cardId.", 400);

    const userCard = await userCardReposity.checkExists(userId, cardId);
    if (userCard) throw new CustomError("You already have this card.", 400);

    const createdUserCard = await userCardReposity.create(userId, cardId);

    const restaurant = await restaurantRepository.getById(
      db,
      isValidCard.restaurantId
    );
    await notificationRepository.create(db, {
      userId: userId,
      message: `You added ${restaurant.name} membership.`,
      type: "CARD",
    });

    return createdUserCard;
  },
  delete: async (id: string) => {
    const userCard = await userCardReposity.getById(id);

    const deletedUserCard = await userCardReposity.delete(userCard.id);
    return deletedUserCard;
  },
  addIfNotExists: async (userId: string, restaurantId: string) => {
    const card = await cardRepository.getByRestaurantId(restaurantId);
    let userCard = await userCardReposity.getByUserIdRestaurantId(
      userId,
      restaurantId
    );

    if (!userCard) {
      userCard = await userCardReposity.create(userId, card[0].id);
    }

    return userCard;
  },
};
