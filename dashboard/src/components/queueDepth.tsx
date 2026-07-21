import type { QueueDepth as QueueDepthType } from "../types/queue";

type Props = {
  queueDepth: QueueDepthType[];
};
export const QueueDepth = ({ queueDepth }: Props) => {
  // const [queueDepth, setQueueDepth] = useState<QueueDepthType[]>([]);
  // const [error, setError] = useState("");
  // const [isLoadings, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const fetchQueueDepth = async () => {
  //     try {
  //       const data = await getQueueDepth();
  //       setQueueDepth(data);
  //     } catch (error) {
  //       setError("Failed to load queue depth");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchQueueDepth();
  // }, []);

  // if (error) {
  //   return <p>{error}</p>;
  // }
  // if (isLoading) {
  //   return <p>Loading queue depth...</p>;
  // }
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <div className="border-b border-hairline px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Queue Depth</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs tracking-wide text-ink-muted uppercase">
              <th className="px-5 py-2.5 font-medium">Job Type</th>
              <th className="px-5 py-2.5 font-medium">Queued Jobs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {queueDepth.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-6 text-center text-ink-muted">
                  Nothing queued.
                </td>
              </tr>
            ) : (
              queueDepth.map((queue) => (
                <tr key={queue.type} className="hover:bg-ink/5">
                  <td className="px-5 py-3 text-ink">{queue.type}</td>
                  <td className="px-5 py-3 font-mono text-ink-secondary tabular-nums">
                    {queue.count}
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
