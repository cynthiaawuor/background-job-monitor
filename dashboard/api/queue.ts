import type { QueueDepth } from "../src/types/queue.js";
import { api } from "./client.js";

export const getQueueDepth = async (): Promise<QueueDepth[]> => {
  const { data } = await api.get("/queue/depth");
  return data;
};
