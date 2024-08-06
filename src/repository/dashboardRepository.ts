import { sql } from "kysely";
import { db } from "../utils/db";

export const dashboardRepository = {
  getTapByDate: async (
    restaurantId: string,
    startDate: Date,
    endDate: Date,
    location: string
  ) => {
    const data =
      await sql`select gs.date::date AS date, COALESCE(query_result.tapCount, 0) AS "tapCount"
FROM generate_series(${startDate}::date, ${endDate}::date, '1 day'::interval) gs(date)
LEFT JOIN (
	select t."tappedAt"::date as creation_date, count(*) as tapCount
	    from "Tap" t
	    inner join "UserCard" uc on uc.id = t."userCardId" 
	    inner join "Card" c on c.id = uc."cardId" 
	    inner join "Restaurant" r on r.id = c."restaurantId"
	    inner join "User" u on u.id = uc."userId"
	    where r.id = ${restaurantId} AND (${location}='1' OR u."location" = ${location})
	    group by t."tappedAt"::date, r.id
	    order by t."tappedAt"::date
        ) query_result ON gs.date = query_result.creation_date
        ORDER BY gs.date;`.execute(db);

    return data.rows;
  },
  getTapByArea: async (
    restaurantId: string,
    startDate: Date,
    endDate: Date
  ) => {
    const data = await sql`SELECT
    COALESCE(location, 'undefined') AS location,
    SUM(CASE WHEN tapCount = 1 THEN 1 ELSE 0 END) AS "1",
    SUM(CASE WHEN tapCount = 2 THEN 1 ELSE 0 END) AS "2",
    SUM(CASE WHEN tapCount = 3 THEN 1 ELSE 0 END) AS "3",
    SUM(CASE WHEN tapCount = 4 THEN 1 ELSE 0 END) AS "4",
    SUM(CASE WHEN tapCount = 5 THEN 1 ELSE 0 END) AS "5",
    SUM(CASE WHEN tapCount > 5 THEN 1 ELSE 0 END) AS "+5"
FROM (
    SELECT
        u.location,
        u.id AS "userId",
        r.id AS "restaurantId",
        COUNT(u.id) AS tapCount
    FROM
        "Tap" t 
        INNER JOIN "UserCard" uc ON uc.id = t."userCardId" 
        INNER JOIN "Card" c ON c.id = uc."cardId" 
        INNER JOIN "Restaurant" r ON r.id = c."restaurantId" 
        INNER JOIN "User" u ON u.id = t."userId" 
    WHERE
        r.id = ${restaurantId}
        AND t."tappedAt" BETWEEN ${startDate} AND ${endDate}
    GROUP BY
        u.id, r.id, u.location
) AS subquery
GROUP BY location;`.execute(db);

    return data.rows;
  },
  getTapByFrequency: async (
    restaurantId: string,
    startDate: Date,
    endDate: Date
  ) => {
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
            r.id = (select * from myconstants) 
            AND t."tappedAt" BETWEEN ${startDate} AND ${endDate}
        GROUP BY
            u.id, r.id
    ) AS subquery`.execute(db);
    return data.rows;
  },
};
