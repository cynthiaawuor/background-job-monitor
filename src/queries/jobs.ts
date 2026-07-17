import { and, eq, sql } from "drizzle-orm";
import { jobs, type Job } from "../db/schema/jobs.js";
import { db } from "../index.js";

export const createJob = async (data: Job) => {
  const [job] = await db.insert(jobs).values(data).returning();
  return job;
};

export const updateJob = async (id: string, data: Partial<Job>) => {
  const [job] = await db
    .update(jobs)
    .set(data)
    .where(eq(jobs.id, id))
    .returning();
  return job;
};

export const findJobById = async (id: string) => {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
  return job;
};

export const findOldestQueuedJob = async (tx: any) => {
  const result = await tx.execute(sql`
    SELECT * FROM jobs WHERE state='queued'
    ORDER BY priority DESC,
    created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
    `);

  return result.rows[0] ?? null;
};

export const reclaimWorkerJobs = async (tx: any, workerId: string) => {
  return await tx
    .update(jobs)
    .set({
      state: "queued",
      workerId: null,
      startedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(jobs.workerId, workerId), eq(jobs.state, "in_flight")))
    .returning();
};
