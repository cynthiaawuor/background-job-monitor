import { reclaimJobsFromDeadWorker } from "./services/queue.js";

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const startRecovery = async () => {
  while (true) {
    await reclaimJobsFromDeadWorker();

    await sleep(5000);
  }
};
