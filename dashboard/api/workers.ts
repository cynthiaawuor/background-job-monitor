import type { Worker } from "../src/types/worker.js";
import { api } from "./client.js";

export const getWorkers = async (): Promise<Worker[]> => {
  const { data } = await api.get("/workers");

  return data;
};
