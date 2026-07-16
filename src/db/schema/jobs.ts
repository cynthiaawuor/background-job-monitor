import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { workers } from "./workers.js";

export const jobStateEnum = pgEnum("job_state", [
  "queued",
  "in_flight",
  "completed",
  "failed",
]);
export const jobPriorityEnum = pgEnum("job_priority", ["high", "normal"]);

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),

  type: text("type").notNull(),

  payload: jsonb("payload").notNull(),

  priority: jobPriorityEnum("priority").default("normal").notNull(),

  state: jobStateEnum("state").default("queued").notNull(),

  workerId: text("worker_id").references(() => workers.id, {
    onDelete: "set null",
  }),

  error: text("error"),

  stackTrace: text("stack_trace"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  startedAt: timestamp("started_at"),

  finishedAt: timestamp("finished_at"),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Job = typeof jobs.$inferInsert;
export type JobPriority = typeof jobPriorityEnum;
