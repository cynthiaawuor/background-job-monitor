import { api } from "./client.js";

export const getInFlightJobs = async () => {
  const { data } = await api.get("/jobs/in-flight");
  return data;
};

export const getCompletedJobs = async () => {
  const { data } = await api.get("/jobs/completed");
  return data;
};

export const getFailedJobs = async () => {
  const { data } = await api.get("/jobs/failed");

  return data;
};

export const retryJob = async (id: string) => {
  return api.post(`/jobs/${id}/retry`);
};
