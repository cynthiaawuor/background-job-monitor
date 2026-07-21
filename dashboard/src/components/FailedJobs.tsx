import { retryJob } from "../../api/jobs";
import type { FailedJob } from "../types/job";

type Props = {
  failedJobs: FailedJob[];
  onRetry: () => void;
};

export const FailedJobs = ({ failedJobs, onRetry }: Props) => {
  const handleRetry = async (jobId: string) => {
    try {
      await retryJob(jobId);

      // Refresh the failed jobs list owned by the parent
      onRetry();

      alert("Job re-enqueued successfully.");
    } catch {
      alert("Failed to retry job.");
    }
  };

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Failed Jobs</h2>
        {failedJobs.length > 0 && (
          <span className="rounded-full bg-status-critical-bg px-2.5 py-1 text-xs font-medium text-status-critical tabular-nums">
            {failedJobs.length}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-ink-muted uppercase">
              <th className="px-5 py-2.5 font-medium">Job ID</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Worker</th>
              <th className="px-5 py-2.5 font-medium">Error</th>
              <th className="px-5 py-2.5 font-medium">Stack Trace</th>
              <th className="px-5 py-2.5 font-medium">Retry</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-hairline">
            {failedJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-ink-muted">
                  No failed jobs.
                </td>
              </tr>
            ) : (
              failedJobs.map((job) => (
                <tr key={job.id} className="align-top hover:bg-ink/5">
                  <td className="max-w-40 truncate px-5 py-3 font-mono text-xs text-ink-secondary">
                    {job.id}
                  </td>

                  <td className="px-5 py-3 text-ink">{job.type}</td>

                  <td className="px-5 py-3 font-mono text-xs text-ink-secondary">
                    {job.workerId ?? "-"}
                  </td>

                  <td className="px-5 py-3 text-status-critical">
                    {job.error ?? "-"}
                  </td>

                  <td className="px-5 py-3">
                    <pre className="max-w-125 overflow-x-auto rounded-md bg-code-bg p-2 font-mono text-xs whitespace-pre-wrap text-ink-secondary">
                      {job.stackTrace ?? "-"}
                    </pre>
                  </td>

                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleRetry(job.id)}
                      className="rounded-md border border-accent-border bg-accent-bg px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Retry
                    </button>
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
