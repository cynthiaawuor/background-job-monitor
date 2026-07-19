export const WebSocketEvents = {
  JOB_ENQUEUED: "job.enqueued",
  JOB_CLAIMED: "job.claimed",
  JOB_COMPLETED: "job.completed",
  JOB_FAILED: "job.failed",
  JOB_RECLAIMED: "job.reclaimed",

  WORKER_UPDATED: "worker.updated",
} as const;
