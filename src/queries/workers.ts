import { workers } from "../db/schema/workers.js";
import { db } from "../index.js";

/**
 * 
 * @param id 
 * @returns a worker object.  worker: { id: string;
    status: "alive" | "dead";
    lastHeartbeat: Date;
    createdAt: Date;
    updatedAt: Date;} | undefined
 * 
 * Incase a worker already exists, ignore and continue
 */
export const createWorker = async (id: string) => {
  const [worker] = await db
    .insert(workers)
    .values({
      id,
      status: "alive",
    })
    .onConflictDoNothing()
    .returning();
  return worker;
};
