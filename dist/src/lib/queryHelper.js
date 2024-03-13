"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.to_tsquery = exports.to_tsvector = void 0;
const kysely_1 = require("kysely");
function to_tsvector(expr) {
    return (0, kysely_1.sql) `to_tsvector(${kysely_1.sql.lit("english")}, ${expr})`;
}
exports.to_tsvector = to_tsvector;
function to_tsquery(expr) {
    return (0, kysely_1.sql) `to_tsquery(${kysely_1.sql.lit("english")}, ${expr} || ':*')`;
}
exports.to_tsquery = to_tsquery;
