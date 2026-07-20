import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { getWorkers } from "../queries/workers.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const workers = await getWorkers();
    res.json(workers);
  } catch (error) {
    next(error);
  }
});

export default router;
