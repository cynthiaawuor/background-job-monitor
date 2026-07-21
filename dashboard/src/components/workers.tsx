import type { Worker } from "../types/worker";
type Props = {
  workers: Worker[];
};
export const Workers = ({ workers }: Props) => {
  //   const [workers, setWorkers] = useState<Worker[]>([]);
  //   const [error, setError] = useState("");
  //   const [loading, setIsLoading] = useState(false);

  //   useEffect(() => {
  //     const fetchWokers = async () => {
  //       try {
  //         const workers = await getWorkers();

  //         setWorkers(workers);
  //       } catch (error) {
  //         console.log({ error });
  //         setError("Failed to load workers");
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };
  //     fetchWokers();
  //   }, []);

  //   if (error) {
  //     return <p>{error}</p>;
  //   }
  //   if (loading) {
  //     return <p>Loading workers</p>;
  //   }
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <div className="border-b border-hairline px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Workers</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-ink-muted uppercase">
              <th className="px-5 py-2.5 font-medium">Worker ID</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Last Heartbeat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {workers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-ink-muted">
                  No workers registered.
                </td>
              </tr>
            ) : (
              workers.map((worker) => {
                const isAlive = worker.status === "alive";
                return (
                  <tr key={worker.id} className="hover:bg-ink/5">
                    <td className="px-5 py-3 font-mono text-xs text-ink-secondary">
                      {worker.id}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
                          (isAlive
                            ? "bg-status-good-bg text-status-good"
                            : "bg-status-critical-bg text-status-critical")
                        }
                      >
                        <span
                          className={
                            "size-1.5 rounded-full " +
                            (isAlive ? "bg-status-good" : "bg-status-critical")
                          }
                          aria-hidden="true"
                        />
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-secondary">
                      {new Date(worker.lastHeartbeat).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
