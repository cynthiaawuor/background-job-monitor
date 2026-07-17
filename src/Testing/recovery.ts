import { reclaimJobsFromDeadWorker } from "../services/queue.js";

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  while (true) {
    await reclaimJobsFromDeadWorker();

    await sleep(5000);
  }
}

main().catch(console.error);
