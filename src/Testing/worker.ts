import { createWorker } from "../queries/workers.js";
import { claimNextJob, completeJob, failJob } from "../services/queue.js";

const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
const main = async () => {
  const workerId = "worker-1";
  await createWorker(workerId);

  const job = await claimNextJob(workerId);

  if (!job) {
    console.log("No queued jobs found.");
    return;
  }

  console.log("Claimed job:", job);
  try {
    console.log("Processing next job...");

    await sleep(3000);

    console.log("Job Completed...");
    await completeJob(job.id);
  } catch (error) {
    await failJob(job.id, error);
  }
};

main().catch(console.error);
