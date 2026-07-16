import { enqueueJob } from "../services/queue.js";

async function main() {
  const job = await enqueueJob("email", {
    export: "file.pdf",
    subject: "Download pdf",
  });

  console.log("Job created:");
  console.log(job);
}

main().catch(console.error);
