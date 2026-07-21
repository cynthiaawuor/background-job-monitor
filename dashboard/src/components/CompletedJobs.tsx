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
    <section>
      <h2>Completed Jobs</h2>

      <table>
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Type</th>
            <th>Worker</th>
            <th>Finished At</th>
          </tr>
        </thead>

        <tbody>
          {completedJobs.map((job) => (
            <tr key={job.id}>
              <td>{job.id}</td>

              <td>{job.type}</td>

              <td>{job.workerId ?? "-"}</td>

              <td>
                {job.finishedAt
                  ? new Date(job.finishedAt).toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
