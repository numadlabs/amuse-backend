import { sql } from "kysely";
import { db } from "../utils/db";

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
    const data =
      await sql`select r.id, (r."givenOut" / r.budget * 100) as "Awarded", (SUM(b.price) / r.budget  * 100) as "Redeemed"
    from "Purchase" p 
    inner join "UserBonus" ub ON ub.id = p."userBonusId" 
    inner join "Bonus" b on b.id = ub."bonusId" 
    inner join "UserCard" uc on uc.id = ub."userCardId" 
    inner join "Card" c on c.id = uc."cardId" 
    inner join "Restaurant" r on r.id = c."restaurantId" 
    where r.id = ${restaurantId}
    group by r.id`.execute(db);

    return data.rows;
  },
  getTapByCheckIn: async (restaurantId: string, selectedInterval: string) => {
    //need to do update on interval
    const data = await sql`
    with myconstants (res_id) as (
      values (${restaurantId}))
    select
      coalesce((select * from myconstants), 'undefined') as restaurantId,
        SUM(CASE WHEN tapCount = 1 THEN 1 ELSE 0 END) as "1",
        SUM(CASE WHEN tapCount = 2 THEN 1 ELSE 0 END) as "2",
        SUM(CASE WHEN tapCount = 3 THEN 1 ELSE 0 END) as "3",
        SUM(CASE WHEN tapCount = 4 THEN 1 ELSE 0 END) as "4",
        SUM(CASE WHEN tapCount = 5 THEN 1 ELSE 0 END) as "5",
        SUM(CASE WHEN tapCount > 5 THEN 1 ELSE 0 END) as "+5"
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
};