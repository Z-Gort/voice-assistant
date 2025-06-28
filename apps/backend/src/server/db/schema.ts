import {
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  chatHistory: text("chat_history"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});