import { dashboardRepository } from "../repository/dashboardRepository";
import { tapRepository } from "../repository/tapRepository";
import { transactionRepository } from "../repository/transactionRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { employeeServices } from "./employeeServices";

export const dashboardServices = {
  getTapByDate: async (
    employeeId: string,
    restaurantId: string,
    dayNo: number
  ) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayNo);

    const data = await dashboardRepository.getTapByDate(
      restaurantId,
      startDate,
      endDate
    );

    return data;
  },
  getTapByArea: async (
    employeeId: string,
    restaurantId: string,
    dayNo: number
  ) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayNo);

    const data = await dashboardRepository.getTapByArea(
      restaurantId,
      startDate,
      endDate
    );

    return data;
  },
  getBudgetPieChart: async (employeeId: string, restaurantId: string) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);

    const { totalDeposit } =
      await transactionRepository.getTotalDepositByRestaurantId(restaurantId);
    const { totalWithdraw } =
      await transactionRepository.getTotalWithdrawByRestaurantId(restaurantId);
    const { totalAmount } = await tapRepository.getTotalAmountByRestaurantId(
      restaurantId
    );
    const { totalBalance } =
      await userCardReposity.getTotalBalanceByRestaurantId(restaurantId);

    const budget = totalDeposit - totalWithdraw;
    const awarded = totalAmount || 0;
    const redeemed = awarded - totalBalance;

    return {
      budgetAmount: budget,
      budgetPercentage: 100,
      awardedAmount: awarded,
      awardedPercentage: parseFloat(((awarded / budget) * 100).toFixed(3)),
      redeemedAmount: redeemed,
      redeemedPercentage: parseFloat(((redeemed / budget) * 100).toFixed(3)),
    };
  },
  getTapByFrequency: async (
    employeeId: string,
    restaurantId: string,
    dayNo: number
  ) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayNo);

    const data = await dashboardRepository.getTapByFrequency(
      restaurantId,
      startDate,
      endDate
    );

    return data;
  },
  getTotals: async (employeeId: string, restaurantId: string) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);

    const { totalAmount } = await tapRepository.getTotalAmountByRestaurantId(
      restaurantId
    );
    const { totalBalance } =
      await userCardReposity.getTotalBalanceByRestaurantId(restaurantId);

    const awarded = totalAmount || 0;
    const redeemed = awarded - totalBalance;

    const currentDate = new Date();

    const dateMonthBefore = new Date();
    dateMonthBefore.setMonth(dateMonthBefore.getMonth() - 1);

    const dateTwoMonthsBefore = new Date();
    dateTwoMonthsBefore.setMonth(dateTwoMonthsBefore.getMonth() - 2);

    const previousMonthTap = await tapRepository.getCountByRestaurantId(
      restaurantId,
      dateTwoMonthsBefore,
      dateMonthBefore
    );
    const currentMonthTap = await tapRepository.getCountByRestaurantId(
      restaurantId,
      dateMonthBefore,
      currentDate
    );

    const previousMonthUserCards =
      await userCardReposity.getCountByRestaurantId(
        restaurantId,
        dateTwoMonthsBefore,
        dateMonthBefore
      );
    const currentMonthUserCards = await userCardReposity.getCountByRestaurantId(
      restaurantId,
      dateMonthBefore,
      currentDate
    );

    const previousMonthUsedBonus =
      await userCardReposity.getCountByRestaurantId(
        restaurantId,
        dateTwoMonthsBefore,
        dateMonthBefore
      );
    const currentMonthUsedBonus = await userCardReposity.getCountByRestaurantId(
      restaurantId,
      dateMonthBefore,
      currentDate
    );

    return {
      members: {
        count: currentMonthUserCards.count,
        percentageDifferential:
          currentMonthUserCards.count / previousMonthUserCards.count - 1,
      },
      taps: {
        count: currentMonthTap.count,
        percentageDifferential: parseFloat(
          (currentMonthTap.count / previousMonthTap.count - 1).toFixed(2)
        ),
      },
      redeems: {
        count: redeemed,
        percentageDifferential: 0,
      },
      usedBonus: {
        count: currentMonthUsedBonus.count,
        percentageDifferential: parseFloat(
          (
            currentMonthUsedBonus.count / previousMonthUsedBonus.count -
            1
          ).toFixed(2)
        ),
      },
    };
  },
};
