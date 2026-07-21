import { db } from "../db/db-connection.js";
import { jobEvents, type JobEvent } from "../db/schema/job_events.js";

export const createJobEvent = async (payload: JobEvent) => {
  const [event] = await db.insert(jobEvents).values(payload).returning();
  return event;
};
