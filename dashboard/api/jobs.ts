import type { CompletedJob, FailedJob, InFlightJob } from "../src/types/job.js";
import { api } from "./client.js";

export const getInFlightJobs = async (): Promise<InFlightJob[]> => {
  const { data } = await api.get("/jobs/in-flight");
  return data;
};

export const getCompletedJobs = async (): Promise<CompletedJob> => {
  const { data } = await api.get("/jobs/completed");
  return data;
};

export const getFailedJobs = async (): Promise<FailedJob> => {
  const { data } = await api.get("/jobs/failed");

  return data;
};

export const retryJob = async (id: string) => {
  return api.post(`/jobs/${id}/retry`);
};
