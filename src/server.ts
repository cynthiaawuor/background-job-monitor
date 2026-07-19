import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import queueRoutes from "./routes/queue.js";
import jobRoutes from "./routes/jobs.js";
import workerRoutes from "./routes/workers.js";

const app = express();

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export const db = drizzle(process.env.DB_URL!);
