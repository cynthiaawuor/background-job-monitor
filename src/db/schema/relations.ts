import { relations } from "drizzle-orm/_relations";
import { jobs } from "./jobs.js";
import { workers } from "./workers.js";
import { jobEvents } from "./job_events.js";

//A job has one worker
//A job has many events
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  worker: one(workers, {
    fields: [jobs.workerId],
    references: [workers.id],
  }),
  events: many(jobEvents),
}));

//one worker has many jobs
export const workersRelations = relations(workers, ({ many }) => ({
  jobs: many(jobs),
}));
