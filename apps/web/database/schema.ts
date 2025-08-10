import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const chats = pgTable("chats", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	title: text().notNull(),
});
