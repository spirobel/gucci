import { sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
export const sessionCookies = sqliteTable("session_cookies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cookie: text("cookie"),
  address: text("address"),
  timestamp: text("timestamp").default(sql`(CURRENT_TIMESTAMP)`),
});

export type SessionCookie = typeof sessionCookies.$inferSelect;
export type NewSessionCookie = typeof sessionCookies.$inferInsert;
