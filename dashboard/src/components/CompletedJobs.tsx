import type { CompletedJob } from "../types/job";

type Props = {
  completedJobs: CompletedJob[];
};
export const CompletedJobs = ({ completedJobs }: Props) => {
  //   const [jobs, setJobs] = useState<CompletedJob[]>([]);
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState("");

  //   useEffect(() => {
  //     const fetchJobs = async () => {
  //       try {
  //         const data = await getCompletedJobs();
  //         setJobs(data);
  //       } catch {
  //         setError("Failed to load completed jobs.");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchJobs();
  //   }, []);

  //   if (loading) {
  //     return <p>Loading completed jobs...</p>;
  //   }

  //   if (error) {
  //     return <p>{error}</p>;
  //   }

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <div className="border-b border-hairline px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Completed Jobs</h2>
      </div>

      <div className="max-h-96 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-hairline text-xs tracking-wide text-ink-muted uppercase">
              <th className="px-5 py-2.5 font-medium">Job ID</th>
              <th className="px-5 py-2.5 font-medium">Type</th>
              <th className="px-5 py-2.5 font-medium">Worker</th>
              <th className="px-5 py-2.5 font-medium">Finished At</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-hairline">
            {completedJobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-ink-muted">
                  No completed jobs yet.
                </td>
              </tr>
            ) : (
              completedJobs.map((job) => (
                <tr key={job.id} className="hover:bg-ink/5">
                  <td className="max-w-40 truncate px-5 py-3 font-mono text-xs text-ink-secondary">
                    {job.id}
                  </td>

                  <td className="px-5 py-3 text-ink">{job.type}</td>

                  <td className="px-5 py-3 font-mono text-xs text-ink-secondary">
                    {job.workerId ?? "-"}
                  </td>

                  <td className="px-5 py-3 text-ink-secondary">
                    {job.finishedAt
                      ? new Date(job.finishedAt).toLocaleString()
                      : "-"}
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
