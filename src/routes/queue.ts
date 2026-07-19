import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { getQueueDepth } from "../queries/jobs.js";

const router = Router();

router.get(
  "/depth",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queueDepth = await getQueueDepth();

      return res.json(queueDepth);
    } catch (error) {
      next(error);
    }
  },
);
export default router;
