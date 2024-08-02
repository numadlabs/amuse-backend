import { currencyRepository } from "../repository/currencyRepository";
import { dashboardRepository } from "../repository/dashboardRepository";
import { restaurantRepository } from "../repository/restaurantRepository";
import { tapRepository } from "../repository/tapRepository";
import { transactionRepository } from "../repository/transactionRepository";
import { userBonusRepository } from "../repository/userBonusRepository";
import { userCardReposity } from "../repository/userCardRepository";
import { employeeServices } from "./employeeServices";

export const dashboardServices = {
  getTapByDate: async (
    employeeId: string,
    restaurantId: string,
    dayNo: number | null
  ) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);
    const restaurant = await restaurantRepository.getById(restaurantId);

    const endDate = new Date();
    let startDate = new Date();
    const createdDate = new Date(restaurant.createdAt);

    if (!dayNo) {
      startDate = new Date(restaurant.createdAt);
    } else {
      startDate.setDate(startDate.getDate() - dayNo);
    }

    if (startDate < createdDate) startDate = createdDate;

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

    const restaurant = await restaurantRepository.getById(restaurantId);

    const endDate = new Date();
    let startDate = new Date();
    const createdDate = new Date(restaurant.createdAt);

    if (!dayNo) {
      startDate = new Date(restaurant.createdAt);
    } else {
      startDate.setDate(startDate.getDate() - dayNo);
    }

    if (startDate < createdDate) startDate = createdDate;

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

    const btc = await currencyRepository.getByTicker("BTC");
    const currency = await currencyRepository.getByTicker("EUR");

    return {
      budgetAmount: budget * btc.price * currency.price,
      budgetPercentage: 100,
      awardedAmount: awarded * btc.price * currency.price,
      awardedPercentage: parseFloat(((awarded / budget) * 100).toFixed(3)),
      redeemedAmount: redeemed * btc.price * currency.price,
      redeemedPercentage: parseFloat(((redeemed / budget) * 100).toFixed(3)),
    };
  },
  getTapByFrequency: async (
    employeeId: string,
    restaurantId: string,
    dayNo: number
  ) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);

    const restaurant = await restaurantRepository.getById(restaurantId);

    const endDate = new Date();
    let startDate = new Date();
    const createdDate = new Date(restaurant.createdAt);

    if (!dayNo) {
      startDate = new Date(restaurant.createdAt);
    } else {
      startDate.setDate(startDate.getDate() - dayNo);
    }

    if (startDate < createdDate) startDate = createdDate;

    const data = await dashboardRepository.getTapByFrequency(
      restaurantId,
      startDate,
      endDate
    );

    return data;
  },
  getTotals: async (employeeId: string, restaurantId: string) => {
    await employeeServices.checkIfEligible(employeeId, restaurantId);

    const result = await tapRepository.getTotalAmountByRestaurantId(
      restaurantId
    );
    const totalAmount = Number(result.totalAmount);
    const { totalBalance } =
      await userCardReposity.getTotalBalanceByRestaurantId(restaurantId);

    const awarded = totalAmount;
    const redeemed = Number(awarded - totalBalance);

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
    previousMonthTap.count = Number(previousMonthTap.count);
    const currentMonthTap = await tapRepository.getCountByRestaurantId(
      restaurantId,
      dateMonthBefore,
      currentDate
    );
    currentMonthTap.count = Number(currentMonthTap.count);

    const previousMonthUserCards =
      await userCardReposity.getCountByRestaurantId(
        restaurantId,
        dateTwoMonthsBefore,
        dateMonthBefore
      );
    previousMonthUserCards.count = Number(previousMonthUserCards.count);
    const currentMonthUserCards = await userCardReposity.getCountByRestaurantId(
      restaurantId,
      dateMonthBefore,
      currentDate
    );
    currentMonthUserCards.count = Number(currentMonthUserCards.count);

    const previousMonthUsedBonus =
      await userBonusRepository.getCountByRestaurantId(
        restaurantId,
        dateTwoMonthsBefore,
        dateMonthBefore
      );
    previousMonthUsedBonus.count = Number(previousMonthUsedBonus.count);
    const currentMonthUsedBonus =
      await userBonusRepository.getCountByRestaurantId(
        restaurantId,
        dateMonthBefore,
        currentDate
      );
    previousMonthUsedBonus.count = Number(previousMonthUsedBonus.count);

    return {
      members: {
        count: currentMonthUserCards.count,
        percentageDifferential:
          previousMonthUserCards.count === 0
            ? 0
            : parseFloat(
                (
                  (currentMonthUserCards.count / previousMonthUserCards.count -
                    1) *
                  100
                ).toFixed(2)
              ),
      },
      taps: {
        count: currentMonthTap.count,
        percentageDifferential:
          previousMonthTap.count === 0
            ? 0
            : parseFloat(
                (
                  (currentMonthTap.count / previousMonthTap.count - 1) *
                  100
                ).toFixed(2)
              ),
      },
      redeems: {
        count: redeemed,
        percentageDifferential: 0,
      },
      usedBonus: {
        count: Number(currentMonthUsedBonus.count),
        percentageDifferential:
          previousMonthUsedBonus.count === 0
            ? 0
            : parseFloat(
                (
                  (currentMonthUsedBonus.count / previousMonthUsedBonus.count -
                    1) *
                  100
                ).toFixed(2)
              ),
      },
    };
  },
};
