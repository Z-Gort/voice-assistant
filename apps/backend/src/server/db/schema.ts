import {
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  email: text("email").notNull(),
  refreshToken: text("refresh_token"),
  clerkId: text("clerk_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});