import { useEffect, useState } from "react";
import type { InFlightJob } from "../types/job";

type Props = {
  inFlightJobs: InFlightJob[];
};

const formatElapsed = (startedAt: string | null, now: number) => {
  if (!startedAt) {
    return "-";
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - new Date(startedAt).getTime()) / 1000),
  );
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

export const InFlightJobs = ({ inFlightJobs }: Props) => {
  const [now, setNow] = useState(() => Date.now());

  // Ticks once a second so elapsed time updates without a page refresh
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section>
      <h2>In-Flight Jobs</h2>

      <table>
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Type</th>
            <th>Worker</th>
            <th>Started At</th>
            <th>Elapsed</th>
          </tr>
        </thead>

        <tbody>
          {inFlightJobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>

              <td>{job.type}</td>

              <td>{job.workerId ?? "-"}</td>

              <td>
                {job.startedAt ? new Date(job.startedAt).toLocaleString() : "-"}
              </td>

              <td>{formatElapsed(job.startedAt, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
