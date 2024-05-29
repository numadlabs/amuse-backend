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

  getTapByCheckIn: async (restaurantId: string, selectedInterval: string) => {
    //need to do update on interval
    const data = await sql`
    with myconstants (res_id) as (
      values (${restaurantId})),
    checkin_ranges as (
        select '1' as range
        union all
        select '2' as range
        union all
        select '3' as range
        union all
        select '4' as range
        union all
        select '5' as range
        union all
        select '+5' as range
    ),
    restaurant_checkins as (
        select "UserCard"."cardId", "Card"."restaurantId", "Tap"."userId", COUNT(*) as checkin_count from "Tap" 
        inner join "UserCard" on "Tap"."userCardId" = "UserCard".id 
        inner join "Card" on "UserCard"."cardId" = "Card".id  
        where "tappedAt" >= NOW() - INTERVAL '1 month'
        group by "UserCard"."cardId", "Card"."restaurantId", "Tap"."userId" 
        order by "Card"."restaurantId" 
    ),
    --select * from restaurant_checkins;
    checkin_counts as (select 
      "restaurantId",
        case
            when checkin_count = 1 then '1'
            when checkin_count = 2 then '2'
            when checkin_count = 3 then '3'
            when checkin_count = 4 then '4'
            when checkin_count = 5 then '5'
            ELSE '+5'
        end as checkin_range,
        count(*) as users_count
    from
       restaurant_checkins
    where 
      "restaurantId" = (select * from myconstants)
    group by
        "restaurantId", checkin_range
    order by
      "restaurantId", checkin_range)
    select 
      COALESCE(c."restaurantId", (SELECT res_id FROM myconstants)) AS "restaurantId",
        r.range as checkin_range,
        COALESCE(c.users_count, 0) as users_count
    FROM 
        checkin_ranges r
    left JOIN 
        checkin_counts c ON r.range = c.checkin_range
    ORDER BY 
        COALESCE(c."restaurantId", (SELECT res_id FROM myconstants)), r.range;`.execute(
      db
    );
    return data.rows;
  },
};
