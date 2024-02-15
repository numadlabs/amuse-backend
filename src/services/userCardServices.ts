import { UserCard } from "@prisma/client";
import { Insertable } from "kysely";
import { cardRepository } from "../repository/cardRepository";
import { userCardReposity } from "../repository/userCardRepository";

export const userCardServices = {
  buy: async (data: Insertable<UserCard>) => {
    const userCard = await userCardReposity.checkExists(
      data.userId,
      data.cardId
    );
    if (userCard) throw new Error("You already have this card.");

    const isValidCard = await cardRepository.getById(data.cardId);
    if (!isValidCard) throw new Error("Invalid restaurant id.");

    const createdUserCard = await userCardReposity.create(data);
    return createdUserCard;
  },
  delete: async (id: string) => {
    const userCard = await userCardReposity.getById(id);

    const deletedUserCard = await userCardReposity.delete(userCard.id);
    return deletedUserCard;
  },
};
