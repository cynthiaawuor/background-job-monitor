import { and, desc, eq, gt, lt } from "drizzle-orm";
import { workers } from "../db/schema/workers.js";
import { db } from "../db/db-connection.js";

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
  const [worker] = await db
    .update(workers)
    .set({
      lastHeartbeat: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(workers.id, workerId), eq(workers.status, "alive")))
    .returning();
  return worker;
};

export const findWorkerById = async (workerId: string) => {
  const [worker] = await db
    .select()
    .from(workers)
    .where(eq(workers.id, workerId));
  return worker;
};

/**
 *
 * @params transaction object,interval,worker id
 * @returns worker(s) which has been dead for more that 30sec
 */

export const markWorkersDead = async (tx: any, interval: Date) => {
  return await tx
    .update(workers)
    .set({
      status: "dead",
      updatedAt: new Date(),
    })
    .where(
      and(eq(workers.status, "alive"), lt(workers.lastHeartbeat, interval)),
    )
    .returning();
};

export const getWorkers = async () => {
  return await db
    .select({
      id: workers.id,
      status: workers.status,
      lastHeartbeat: workers.lastHeartbeat,
    })
    .from(workers)
    .orderBy(desc(workers.lastHeartbeat));
};
