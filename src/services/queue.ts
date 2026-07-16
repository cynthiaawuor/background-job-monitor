import { eq } from "drizzle-orm";
import { jobs } from "../db/schema/jobs.js";
import { db } from "../index.js";
import { createJobEvent } from "../queries/job_events.js";
import {
  createJob,
  findJobById,
  findOldestQueuedJob,
  updateJob,
} from "../queries/jobs.js";
import { jobEvents } from "../db/schema/job_events.js";

export const enqueueJob = async (
  type: string,
  payload: unknown,
  priority?: "normal" | "high",
) => {
  const job = await createJob({ type, payload, priority, state: "queued" });
  if (!job) {
    return;
  }
  await createJobEvent({
    jobId: job.id,
    event: "queued",
  });
  return job;
};

/***
 * A worker claims next job as one atomic operation.
 * The job row is then locked prevent other workers from accessing it at the same time
 * The job events is updated with the claimed job
 */

export const claimNextJob = async (workerId: string) => {
  return await db.transaction(async (tx) => {
    const job = await findOldestQueuedJob(tx);

    /* A worker claims the oldest queued job (arrival order)
     *  and marks it in-flight with its identity and a start time.
     *
     */
    const [claimedJob] = await tx
      .update(jobs)
      .set({ state: "in_flight", workerId, startedAt: new Date() })
      .where(eq(jobs.id, job.id))
      .returning();
    if (!claimedJob) {
      return null;
    }

    //Save history of jobEvents
    await tx.insert(jobEvents).values({
      jobId: claimedJob.id,
      workerId,
      event: "claimed",
    });
    return claimedJob;
  });
};

export const completeJob = async (jobId: string) => {
  const job = await findJobById(jobId);
  if (!job) {
    return { message: "Job Not Found." };
  }
  if (job.state !== "in_flight") {
    return { message: "Only jobs in-flight can be completed" };
  }

  const updatedJob = await updateJob(jobId, {
    state: "completed",
    finishedAt: new Date(),
  });
  //update job event history

  await createJobEvent({
    jobId,
    workerId: job.id,
    event: "completed",
  });
  return updatedJob;
};

export const failJob = async (jobId: string, error: unknown) => {
  const job = await findJobById(jobId);
  if (!job) {
    return { message: "Job Not Found" };
  }
  if (job.state !== "in_flight") {
    return { message: "Only jobs in-flight can fail" };
  }

  const isErrorObject = error instanceof Error;
  const message = isErrorObject ? error.message : String(error);
  const stackTrace = isErrorObject ? error.stack : undefined;
  const updatedJob = await updateJob(jobId, {
    state: "failed",
    error: message,
    stackTrace,
    finishedAt: new Date(),
  });
  return updatedJob;
};
