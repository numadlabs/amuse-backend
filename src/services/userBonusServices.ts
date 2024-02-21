import { encryptionHelper } from "../lib/encryptionHelper";
import { userBonusRepository } from "../repository/userBonusRepository";

export const userBonusServices = {
  use: async (id: string, userId: string) => {
    /* 
        check if userBonus is authenticatedUsersOwn 
        check if userBonus is not used
    */
    const userBonus = await userBonusRepository.getById(id);

    if (!userBonus) throw new Error("No corresponding userBonus found.");

    if (userBonus?.userId !== userId)
      throw new Error("You are not allowed to use this bonus.");

    if (userBonus.isUsed) throw new Error("This bonus is used already.");

    const data = {
      userBonusId: userBonus.id,
      issuedAt: Date.now(),
    };

    const encryptedData = encryptionHelper.encryptData(JSON.stringify(data));

    return encryptedData;
  },
  redeem: async (encryptedData: string) => {
    const data = encryptionHelper.decryptData(encryptedData);

    if (Date.now() - data.issuedAt > 60000) throw new Error("Expired QR");

    const userBonusId: string = data.userBonusId;

    const userBonus = await userBonusRepository.getById(userBonusId);
    if (!userBonus) throw new Error("Invalid userBonus.");

    userBonus.isUsed = true;

    const updatedUserBonus = await userBonusRepository.update(
      userBonus.id,
      userBonus
    );

    return updatedUserBonus;
  },
};
