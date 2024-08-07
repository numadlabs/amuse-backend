import { Insertable, Updateable } from "kysely";
import { Bonus } from "../types/db/types";
import { cardRepository } from "../repository/cardRepository";
import { CustomError } from "../exceptions/CustomError";
import { bonusRepository } from "../repository/bonusRepository";

export const bonusServices = {
  create: async (data: Insertable<Bonus>) => {
    if (!data.cardId) throw new CustomError("Please provide a cardId.", 400);
    const card = await cardRepository.getById(data.cardId);
    if (!card) throw new CustomError("Card not found.", 400);

    if (data.type === "SINGLE" && !data.visitNo)
      throw new CustomError("Invalid input for given type.", 400);

    if (data.type === "REDEEMABLE" && !data.price)
      throw new CustomError("Invalid input for given type.", 400);

    const bonus = await bonusRepository.create(data);

    return bonus;
  },
  update: async (data: Updateable<Bonus>, id: string) => {
    const bonus = await bonusRepository.getById(id);

    if (data.totalSupply && data.totalSupply < bonus.currentSupply) {
      throw new CustomError(
        "Total supply cannot be lower than the current supply.",
        400
      );
    }

    const updatedBonus = await bonusRepository.update(data, id);

    return updatedBonus;
  },
};
