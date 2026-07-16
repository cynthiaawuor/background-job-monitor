import { eq } from "drizzle-orm";
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

export const updateHeartbeat = async (workerId: string) => {
  await db
    .update(workers)
    .set({
      lastHeartbeat: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(workers.id, workerId));
};

export const findWorkerById = async (workerId: string) => {
  const [worker] = await db
    .select()
    .from(workers)
    .where(eq(workers.id, workerId));
  return worker;
};
