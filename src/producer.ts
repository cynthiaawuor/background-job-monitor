import cron from "node-cron";
import { jobs } from "./Testing/producer.js";
import { enqueueJob } from "./services/queue.js";

export const startProducer = () => {
  let index = 0;
  cron.schedule("*/5 * * * * *", async () => {
    if (index >= jobs.length) {
      return;
    }
    const [jobType, payload] = jobs[index]!;
    await enqueueJob(jobType, payload);
    index++;
  });
};
