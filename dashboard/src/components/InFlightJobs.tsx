import { useEffect, useState } from "react";

import { getInFlightJobs } from "../../api/jobs";

import type { InFlightJob } from "../types/job";

export const InFlightJobs = () => {
  const [jobs, setJobs] = useState<InFlightJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getInFlightJobs();
        setJobs(data);
      } catch {
        setError("Failed to load in-flight jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <p>Loading in-flight jobs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

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
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>

              <td>{job.type}</td>

              <td>{job.workerId ?? "-"}</td>

              <td>
                {job.startedAt ? new Date(job.startedAt).toLocaleString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
