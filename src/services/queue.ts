import { and, eq, sql } from "drizzle-orm";
import { jobs } from "../db/schema/jobs.js";
import { db } from "../server.js";
import { createJobEvent } from "../queries/job_events.js";
import {
  createJob,
  findJobById,
  findOldestQueuedJob,
  reclaimWorkerJobs,
  updateJob,
} from "../queries/jobs.js";
import { jobEvents } from "../db/schema/job_events.js";
import { markWorkersDead } from "../queries/workers.js";
import { calculateBackOff } from "./backoff.js";

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
    if (!job) {
      return null;
    }

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

    //Save history of claimed jobEvents
    await tx.insert(jobEvents).values({
      jobId: claimedJob.id,
      workerId,
      event: "claimed",
    });
    return claimedJob;
  });
};

export const completeJob = async (jobId: string, workerId: string) => {
  const job = await findJobById(jobId);
  if (!job) {
    return { message: "Job Not Found." };
  }
  if (job.state !== "in_flight") {
    return { message: "Only jobs in-flight can be completed" };
  }

  if (job.workerId !== workerId) {
    return { message: "Worker nolonger owns this job" };
  }
  /**
   * Update job only if worker still owns it
   */

  const updatedJob = await db
    .update(jobs)
    .set({
      state: "completed",
      finishedAt: new Date(),
    })
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.workerId, workerId),
        eq(jobs.state, "in_flight"),
      ),
    )
    .returning();

  if (!updateJob) {
    return { message: "Job already reclaimed by another worker." };
  }
  //update job event history

  await createJobEvent({
    jobId,
    workerId,
    event: "completed",
  });
  return updatedJob;
};

export const failJob = async (
  jobId: string,
  workerId: string,
  error: unknown,
) => {
  const job = await findJobById(jobId);
  if (!job) {
    return { message: "Job Not Found" };
  }
  if (job.state !== "in_flight") {
    return { message: "Only jobs in-flight can fail" };
  }
  if (job.workerId !== workerId) {
    return { message: "Worker nolonger owns this job" };
  }

  const isErrorObject = error instanceof Error;
  const message = isErrorObject ? error.message : String(error);
  const stackTrace = isErrorObject ? error.stack : undefined;

  /** ****************************************************
   * Retries remaining
   ********************************************************/

  const nextRetryCount = job.retryCount + 1;
  if (nextRetryCount <= job.maxRetries) {
    const delayInMilliSeconds = calculateBackOff(nextRetryCount) * 1000;

    const retryAt = new Date(Date.now() + delayInMilliSeconds);

    await db
      .update(jobs)
      .set({
        state: "delayed",
        retryCount: nextRetryCount,
        retryAt: retryAt,
        error: message,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.workerId, workerId),
          eq(jobs.state, "in_flight"),
        ),
      )
      .returning();
  }

  /**--------------------------------------------------------
   * No retries remaining
   ----------------------------------------------------------*/
  const updatedJob = await db
    .update(jobs)
    .set({
      state: "failed",
      error: message,
      workerId,
      stackTrace,
      finishedAt: new Date(),
    })
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.workerId, workerId),
        eq(jobs.state, "in_flight"),
      ),
    )
    .returning();
  /**
   * Only current owner may fail the job
   */
  if (!updateJob) {
    return { message: "Job already reclaimed by another worker." };
  }

  return updatedJob;
};

export const reclaimJobsFromDeadWorker = async () => {
  const timeout = 30000;
  const cutoffTime = new Date(Date.now() - timeout);
  await db.transaction(async (tx) => {
    const deadWorkers = await markWorkersDead(tx, cutoffTime);

    for (const worker of deadWorkers) {
      const reclaimedJobs = await reclaimWorkerJobs(tx, worker.id);
      if (!reclaimedJobs) {
        continue;
      }

      for (const job of reclaimedJobs) {
        await createJobEvent({
          jobId: job.id,
          workerId: worker.id,
          event: "queued",
        });
      }
    }
  });
};

export const retryJob = async (jobId: string) => {
  return await db.transaction(async (tx) => {
    const [job] = await tx.select().from(jobs).where(eq(jobs.id, jobId));

    /**
     * If job is not found
     */

    if (!job) {
      throw new Error("Job not found");
    }
    /**
     * Job found but not a failed job
     */
    if (job.state !== "failed") {
      throw new Error("Only failed jobs can be retried");
    }

    /**
     * Move job back to queue
     */

    const [updatedJob] = await tx
      .update(jobs)
      .set({
        state: "queued",
        workerId: null,
        startedAt: null,
        finishedAt: null,
        retryAt: null,
        error: null,
        stackTrace: null,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    if (!updatedJob) return;

    /**
     * Update job history (job_events table)
     */
    await createJobEvent({
      jobId: updatedJob.id,
      workerId: null,
      event: "retried",
      metadata: {},
    });

    return {
      status: 200,
      job: updatedJob,
    };
  });
};
