import "dotenv/config";
import { createServer } from "node:http";

import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import queueRoutes from "./routes/queue.js";
import jobRoutes from "./routes/jobs.js";
import workerRoutes from "./routes/workers.js";
import { startWebSocketServer } from "./websocket/server.js";
import { startProducer } from "./producer.js";
import { startWorker } from "./worker.js";
import { startRecovery } from "./recovery.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/jobs", jobRoutes);
app.use("/queue", queueRoutes);
app.use("/workers", workerRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Background Job Monitor API",
  });
});

app.use(errorHandler);

const PORT = 3000;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`REST Server running on http://localhost:${PORT}`);
});

startWebSocketServer(server);

startProducer();

startWorker("worker-A").catch(console.error);
startWorker("worker-B");

startRecovery().catch(console.error);
