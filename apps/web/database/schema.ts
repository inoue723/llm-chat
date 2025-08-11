import { pgTable, uuid, timestamp, text, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const chats = pgTable("chats", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	title: text().notNull(),
});

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	text: text().notNull(),
	role: text().notNull(),
	modelId: text("model_id").notNull(),
	chatId: uuid("chat_id").notNull(),
}, (table) => {
	return {
		messagesChatIdFkey: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "messages_chat_id_fkey"
		}).onDelete("cascade"),
	}
});
