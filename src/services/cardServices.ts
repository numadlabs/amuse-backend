import { Insertable, Updateable } from "kysely";
import { cardRepository } from "../repository/cardRepository";
import { Card, UserCard } from "../types/db/types";
import { restaurantResposity } from "../repository/restaurantRepository";

export const cardServices = {
  update: async (id: string, data: Updateable<Card>) => {
    const card = await cardRepository.getById(id);

    const updatedCard = await cardRepository.update(card.id, data);

    return updatedCard;
  },
  delete: async (id: string) => {
    const card = await cardRepository.getById(id);

    const deletedCard = await cardRepository.delete(card.id);

    return deletedCard;
  },
};
