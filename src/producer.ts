import cron from "node-cron";
// import { jobs } from "./Testing/producer.js";
import { enqueueJob } from "./services/queue.js";

type Job = [jobType: string, payload: object];

const jobs: Job[] = [
  [
    "sendEmail",
    {
      to: "user@example.com",
      subject: "Welcome!",
      body: "Thanks for signing up.",
    },
  ],
  [
    "resizeImage",
    {
      imageUrl: "https://example.com/image.jpg",
      width: 800,
      height: 600,
    },
  ],
  [
    "generateReport",
    {
      reportType: "monthly",
      userId: "usr_12345",
      format: "pdf",
    },
  ],
  [
    "syncInventory",
    {
      warehouseId: "wh_02",
      items: ["sku_001", "sku_045", "sku_099"],
    },
  ],
  [
    "sendPushNotification",
    {
      deviceToken: "abc123xyz",
      title: "Order Shipped",
      message: "Your order #4521 is on its way!",
    },
  ],
];

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
