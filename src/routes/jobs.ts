import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  getCompletedJobs,
  getFailedJobs,
  getInFlightJobs,
} from "../queries/jobs.js";
import { retryJob } from "../services/queue.js";

const router = Router();

router.get(
  "/in-flight",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await getInFlightJobs();

      res.json(jobs);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/completed",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await getCompletedJobs();

      res.json(jobs);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/failed",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await getFailedJobs();

      res.json(jobs);
    } catch (error) {
      next(error);
    }
  },
);

router.post("/:id/retry", async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await retryJob(id);
    if (!result) return;

    res
      .status(200)
      .json({ message: "Job re-enqueued successfully", job: result.job });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Job not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Only failed jobs can be retried") {
        return res.status(400).json({ error: error.message });
      }
    }
    next(error);
  }
});

export default router;
