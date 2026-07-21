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
    <section>
      <h2>Failed Jobs</h2>

      <table>
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Type</th>
            <th>Worker</th>
            <th>Error</th>
            <th>Stack Trace</th>
            <th>Retry</th>
          </tr>
        </thead>

        <tbody>
          {failedJobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>

              <td>{job.type}</td>

              <td>{job.workerId ?? "-"}</td>

              <td>{job.error ?? "-"}</td>

              <td>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    margin: 0,
                    maxWidth: "500px",
                  }}
                >
                  {job.stackTrace ?? "-"}
                </pre>
              </td>

              <td>
                <button onClick={() => handleRetry(job.id)}>Retry</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
