import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { desc } from "drizzle-orm";

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    text: varchar("text", { length: 280 }).notNull(),
    votes: integer("votes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("questions_votes_created_idx").on(desc(t.votes), desc(t.createdAt))],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    ipHash: text("ip_hash").notNull(),
    action: text("action").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.ipHash, t.action, t.windowStart] })],
);
