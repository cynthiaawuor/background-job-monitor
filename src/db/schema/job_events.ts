import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { jobs } from "./jobs.js";

export const jobEventEnum = pgEnum("job_event", [
  "queued",
  "claimed",
  "completed",
  "failed",
  "reclaimed",
  "retried",
]);

export const jobEvents = pgTable("job_events", {
  id: uuid("id").defaultRandom().primaryKey(),

  jobId: uuid("job_id")
    .references(() => jobs.id, {
      onDelete: "cascade",
    })
    .notNull(),

  workerId: text("worker_id"),

  event: jobEventEnum("event").notNull(),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JobEvent = typeof jobEvents.$inferInsert;
