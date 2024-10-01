import { Insertable, Updateable } from "kysely";
import { Bonus } from "../types/db/types";
import { cardRepository } from "../repository/cardRepository";
import { CustomError } from "../exceptions/CustomError";
import { bonusRepository } from "../repository/bonusRepository";
import { db } from "../utils/db";
import { employeeServices } from "./employeeServices";
import { auditTrailRepository } from "../repository/auditTrailRepository";
import { parseChangedFieldsFromObject } from "../lib/parseChangedFieldsFromObject";

export const bonusServices = {
  create: async (data: Insertable<Bonus>, issuerId: string) => {
    if (!data.cardId) throw new CustomError("Please provide a cardId.", 400);
    const card = await cardRepository.getById(data.cardId);
    if (!card) throw new CustomError("Card not found.", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      card.restaurantId
    );
    if (!issuer)
      throw new CustomError("You are not allowed to do this action.", 400);

    if (data.type === "SINGLE" && !data.visitNo)
      throw new CustomError("Invalid input for given type.", 400);

    if (data.type === "REDEEMABLE" && !data.price)
      throw new CustomError("Invalid input for given type.", 400);

    const bonus = await bonusRepository.create(data);

    await auditTrailRepository.create(db, {
      tableName: "BONUS",
      operation: "INSERT",
      data: bonus,
      updatedEmployeeId: issuer.id,
    });

    return bonus;
  },
  update: async (data: Updateable<Bonus>, id: string, issuerId: string) => {
    const bonus = await bonusRepository.getById(id);
    const card = await cardRepository.getById(bonus.cardId);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      card.restaurantId
    );
    if (!issuer)
      throw new CustomError("You are not allowed to do this action.", 400);

    if (data.totalSupply && data.totalSupply < bonus.currentSupply) {
      throw new CustomError(
        "Total supply cannot be lower than the current supply.",
        400
      );
    }

    const updatedBonus = await bonusRepository.update(db, data, id);

    const changedData = parseChangedFieldsFromObject(bonus, updatedBonus);
    await auditTrailRepository.create(db, {
      tableName: "BONUS",
      operation: "UPDATE",
      data: changedData,
      updatedEmployeeId: issuer.id,
    });

    return updatedBonus;
  },
};
