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

const heartbeatLoop = async (workerId: string) => {
  while (true) {
    const worker = await updateHeartbeat(workerId);
    if (!worker) {
      console.log("Worker is not alive");
      process.exit(1);
    }

    console.log("worker heartbeat");
    await sleep(10000);
  }
};
const startWorker = async () => {
  const workerId = `worker-${Math.floor(Math.random() * 100)}`;
  await createWorker(workerId);
  /**
   * Worker sends heartbeat every 10s while running
   */
  // setInterval(async () => {
  //   const worker = await updateHeartbeat(workerId);
  //   if (!worker) {
  //     console.log("Woker has been is not alive");
  //     return;
  //   }
  // }, 10000);

  heartbeatLoop(workerId);

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

      await completeJob(job.id, workerId);

      console.log(`Job ${job.id} Completed...`);
    } catch (error) {
      await failJob(job.id, workerId, error);
    }
  }
};

startWorker().catch(console.error);
