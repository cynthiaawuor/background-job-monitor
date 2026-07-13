import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const workerStatusEnum = pgEnum("worker_status", ["alive", "dead"]);

export const workers = pgTable("workers", {
  id: text("id").primaryKey(),

  status: workerStatusEnum("status").default("alive").notNull(),

  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
