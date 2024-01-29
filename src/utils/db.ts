import { Kysely } from "kysely";

import { PostgresDialect } from "kysely";
import { Pool } from "pg";
// import type { DB } from "@/lib/db/types";
import type { DB } from "../types/db/types";

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: true,
    }),
  }),
});
