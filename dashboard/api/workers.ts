import { api } from "./client.js";

export const getWorkers = async () => {
  const { data } = await api.get("/workers");

  return data;
};
