import { createWorker, updateHeartbeat } from "../queries/workers.js";
import { claimNextJob, completeJob, failJob } from "../services/queue.js";

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const processJob = async (job: any) => {
  console.log(`Processing job ${job.id}`);

  console.log(job.payload);

  /*  simulating the job processing
   * TODO: To be replaced with actual job processing
   */
  await sleep(3000);

  console.log(`Finished Processing ${job.id}`);
};
const startWorker = async () => {
  const workerId = `worker-${Math.floor(Math.random() * 100)}`;
  await createWorker(workerId);
  /**
   * Worker sends heartbeat every 10s while running
   */
  setInterval(async () => {
    await updateHeartbeat(workerId);
  }, 10000);

  /** Worker runs and claims next job,
   * Waits 5sec if no job is found and continues claiming other jobs.
   */
  while (true) {
    const job = await claimNextJob(workerId);

    if (!job) {
      console.log("No queued jobs found.");
      await sleep(5000);
      continue;
    }

    try {
      console.log("Processing next job...");
      await processJob(job);

      await completeJob(job.id);

      console.log(`Job ${job.id} Completed...`);
    } catch (error) {
      await failJob(job.id, error);
    }
  }
};

startWorker().catch(console.error);
