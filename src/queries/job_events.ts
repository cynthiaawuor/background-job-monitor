import { jobEvents, type JobEvent } from "../db/schema/job_events.js";
import { db } from "../server.js";

export const createJobEvent = async (payload: JobEvent) => {
  const [event] = await db.insert(jobEvents).values(payload).returning();
  return event;
};
