"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const kysely_1 = require("kysely");
const kysely_2 = require("kysely");
const pg_1 = require("pg");
exports.db = new kysely_1.Kysely({
    dialect: new kysely_2.PostgresDialect({
        pool: new pg_1.Pool({
            database: process.env.PGDATABASE,
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            ssl: true,
        }),
    }),
});
