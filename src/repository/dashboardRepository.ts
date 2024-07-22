import { sql } from "kysely";
import { db } from "../utils/db";
import { transactionRepository } from "./transactionRepository";
import { tapRepository } from "./tapRepository";
import { userCardReposity } from "./userCardRepository";

enum Interval {
  ONE_WEEK = "1 week",
  ONE_MONTH = "1 month",
  THREE_MONTHS = "3 months",
}

export const dashboardRepository = {
  getTapByDate: async (
    restaurantId: string,
    startDate: Date,
    endDate: Date
  ) => {
    const data = await sql`SELECT
        gs.date::date AS date,
        COALESCE(query_result.tapCount, 0) AS "tapCount"
        FROM 
        generate_series(${startDate}::date, ${endDate}::date, '1 day'::interval) gs(date)
        LEFT JOIN (
	    select t."tappedAt"::date as creation_date, count(*) as tapCount
	    from "Tap" t
	    inner join "UserCard" uc on uc.id = t."userCardId" 
	    inner join "Card" c on c.id = uc."cardId" 
	    inner join "Restaurant" r on r.id = c."restaurantId" 
	    where r.id = ${restaurantId}
	    group by t."tappedAt"::date, r.id
	    order by t."tappedAt"::date
        ) query_result ON gs.date = query_result.creation_date
        ORDER BY gs.date;`.execute(db);

    return data.rows;
  },
  getTapByArea: async (restaurantId: string) => {
    const data = await sql`select
	coalesce(location, 'undefined') as location,
    SUM(CASE WHEN tapCount = 1 THEN 1 ELSE 0 END) as "1",
    SUM(CASE WHEN tapCount = 2 THEN 1 ELSE 0 END) as "2",
    SUM(CASE WHEN tapCount = 3 THEN 1 ELSE 0 END) as "3",
    SUM(CASE WHEN tapCount = 4 THEN 1 ELSE 0 END) as "4",
    SUM(CASE WHEN tapCount = 5 THEN 1 ELSE 0 END) as "5",
    SUM(CASE WHEN tapCount > 5 THEN 1 ELSE 0 END) as "+5"
FROM (
    select
    	u.location,
        u.id as "userId",
        r.id as "restaurantId",
        count(u.id) as tapCount
    FROM
        "Tap" t 
        INNER JOIN "UserCard" uc ON uc.id = t."userCardId" 
        INNER JOIN "Card" c ON c.id = uc."cardId" 
        INNER JOIN "Restaurant" r ON r.id = c."restaurantId" 
        INNER JOIN "User" u ON u.id = t."userId" 
    WHERE
        r.id = ${restaurantId}
    GROUP BY
        u.id, r.id, u.location
) AS subquery
group by location
`.execute(db);

    return data.rows;
  },
  getBudgetPieChart: async (restaurantId: string) => {
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
  getTapByCheckIn: async (restaurantId: string, selectedInterval: string) => {
    //need to do update on interval
    const data = await sql`
    with myconstants (res_id) as (
      values (${restaurantId}))
    select
      coalesce((select * from myconstants), 'undefined') as restaurantId,
        COALESCE(SUM(CASE WHEN tapCount = 1 THEN 1 ELSE 0 END), 0) AS "1",
        COALESCE(SUM(CASE WHEN tapCount = 2 THEN 1 ELSE 0 END), 0) AS "2",
        COALESCE(SUM(CASE WHEN tapCount = 3 THEN 1 ELSE 0 END), 0) AS "3",
        COALESCE(SUM(CASE WHEN tapCount = 4 THEN 1 ELSE 0 END), 0) AS "4",
        COALESCE(SUM(CASE WHEN tapCount = 5 THEN 1 ELSE 0 END), 0) AS "5",
        COALESCE(SUM(CASE WHEN tapCount > 5 THEN 1 ELSE 0 END), 0) AS "+5"
    FROM (
        select
            u.id as "userId",
            r.id as "restaurantId",
            count(u.id) as tapCount
        FROM
            "Tap" t 
            INNER JOIN "UserCard" uc ON uc.id = t."userCardId" 
            INNER JOIN "Card" c ON c.id = uc."cardId" 
            INNER JOIN "Restaurant" r ON r.id = c."restaurantId" 
            INNER JOIN "User" u ON u.id = t."userId" 
        WHERE
            r.id = (select * from myconstants) and
            t."tappedAt" >= NOW() - ${selectedInterval}::interval
        GROUP BY
            u.id, r.id
    ) AS subquery`.execute(db);
    return data.rows;
  },
  getTotals: async (restaurantId: string) => {
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
