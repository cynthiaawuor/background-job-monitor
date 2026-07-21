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
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <h2 className="text-base font-semibold text-ink">In-Flight Jobs</h2>
        <span className="rounded-full bg-accent-bg px-2.5 py-1 text-xs font-medium text-accent tabular-nums">
          {inFlightJobs.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-ink-muted uppercase">
              <th className="px-5 py-2.5 font-medium">Job ID</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Worker</th>
              <th className="px-5 py-2.5 font-medium">Started At</th>
              <th className="px-5 py-2.5 font-medium">Elapsed</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-hairline">
            {inFlightJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-ink-muted">
                  No jobs in flight.
                </td>
              </tr>
            ) : (
              inFlightJobs.map((job) => (
                <tr key={job.id} className="hover:bg-ink/5">
                  <td className="max-w-40 truncate px-5 py-3 font-mono text-xs text-ink-secondary">
                    {job.id}
                  </td>

                  <td className="px-5 py-3 text-ink">{job.type}</td>

                  <td className="px-5 py-3 font-mono text-xs text-ink-secondary">
                    {job.workerId ?? "-"}
                  </td>

                  <td className="px-5 py-3 text-ink-secondary">
                    {job.startedAt
                      ? new Date(job.startedAt).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-5 py-3 font-mono text-ink-secondary tabular-nums">
                    {formatElapsed(job.startedAt, now)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
