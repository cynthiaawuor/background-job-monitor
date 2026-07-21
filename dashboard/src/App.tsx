// import "./App.css";
import { CompletedJobs } from "./components/CompletedJobs";
import { FailedJobs } from "./components/FailedJobs";
import { InFlightJobs } from "./components/InFlightJobs";
import { QueueDepth } from "./components/queueDepth";
import { Workers } from "./components/workers";
import type { QueueDepth as QueueDepthType } from "./types/queue";
import type { Worker } from "./types/worker";
import type { CompletedJob, FailedJob, InFlightJob } from "./types/job";
import { useEffect, useState } from "react";
import { getQueueDepth } from "../api/queue";
import { getWorkers } from "../api/workers";
import { getCompletedJobs, getFailedJobs, getInFlightJobs } from "../api/jobs";
import { connectWebSocket, type WsJob } from "./webSocket/client";

const MAX_COMPLETED_JOBS = 100;

const adjustQueueDepth = (
  queueDepth: QueueDepthType[],
  type: string,
  delta: number,
): QueueDepthType[] => {
  const existing = queueDepth.find((q) => q.type === type);

  if (!existing) {
    return delta > 0 ? [...queueDepth, { type, count: delta }] : queueDepth;
  }

  const nextCount = existing.count + delta;

  return queueDepth
    .map((q) => (q.type === type ? { ...q, count: nextCount } : q))
    .filter((q) => q.count > 0);
};

const toInFlightJob = (job: WsJob): InFlightJob => ({
  id: job.id,
  type: job.type,
  workerId: job.workerId,
  startedAt: job.startedAt,
});

const toCompletedJob = (job: WsJob): CompletedJob => ({
  id: job.id,
  type: job.type,
  workerId: job.workerId,
  finishedAt: job.finishedAt,
});

const toFailedJob = (job: WsJob): FailedJob => ({
  id: job.id,
  type: job.type,
  workerId: job.workerId,
  error: job.error,
  stackTrace: job.stackTrace,
  finishedAt: job.finishedAt,
});

export default function App() {
  const [queueDepth, setQueueDepth] = useState<QueueDepthType[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [inFlightJobs, setInFlightJobs] = useState<InFlightJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);

  const refetchFailedJobs = async () => {
    const failed = await getFailedJobs();
    setFailedJobs(failed);
  };

  //Load the initial snapshot from the REST API
  useEffect(() => {
    const loadDashboard = async () => {
      const [queue, workerList, inFlight, completed, failed] =
        await Promise.all([
          getQueueDepth(),
          getWorkers(),
          getInFlightJobs(),
          getCompletedJobs(),
          getFailedJobs(),
        ]);

      setQueueDepth(queue);
      setWorkers(workerList);
      setInFlightJobs(inFlight);
      setCompletedJobs(completed);
      setFailedJobs(failed);
    };

    loadDashboard();
  }, []);

  // Subscribe to live updates pushed by the server over WebSocket
  useEffect(() => {
    const disconnect = connectWebSocket((message) => {
      switch (message.type) {
        case "job.enqueued": {
          setQueueDepth((prev) =>
            adjustQueueDepth(prev, message.job.type, 1),
          );
          break;
        }

        case "job.claimed": {
          setQueueDepth((prev) =>
            adjustQueueDepth(prev, message.claimedJob.type, -1),
          );
          setInFlightJobs((prev) => {
            if (prev.some((job) => job.id === message.claimedJob.id)) {
              return prev;
            }
            return [...prev, toInFlightJob(message.claimedJob)];
          });
          break;
        }

        case "job.completed": {
          setInFlightJobs((prev) =>
            prev.filter((job) => job.id !== message.updatedJob.id),
          );
          setCompletedJobs((prev) =>
            [toCompletedJob(message.updatedJob), ...prev].slice(
              0,
              MAX_COMPLETED_JOBS,
            ),
          );
          break;
        }

        case "job.failed": {
          setInFlightJobs((prev) =>
            prev.filter((job) => job.id !== message.updatedJob.id),
          );
          setFailedJobs((prev) => [toFailedJob(message.updatedJob), ...prev]);
          break;
        }

        case "job.reclaimed": {
          setInFlightJobs((prev) =>
            prev.filter((job) => job.id !== message.job.id),
          );
          setQueueDepth((prev) => adjustQueueDepth(prev, message.job.type, 1));
          break;
        }

        case "worker.updated": {
          setWorkers((prev) => {
            const exists = prev.some((w) => w.id === message.worker.id);
            if (!exists) {
              return [...prev, message.worker];
            }
            return prev.map((w) =>
              w.id === message.worker.id ? message.worker : w,
            );
          });
          break;
        }
      }
    });

    return disconnect;
  }, []);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10 text-left">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Background Job Monitor
        </h1>
        <span className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-ink-secondary">
          <span className="size-2 rounded-full bg-status-good" aria-hidden="true" />
          Live
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QueueDepth queueDepth={queueDepth} />
        <Workers workers={workers} />
      </div>

      <InFlightJobs inFlightJobs={inFlightJobs} />

      <CompletedJobs completedJobs={completedJobs} />

      <FailedJobs failedJobs={failedJobs} onRetry={refetchFailedJobs} />
    </main>
  );
}
