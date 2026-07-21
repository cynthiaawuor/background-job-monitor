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
    <section>
      <h2>Queue Depth</h2>
      <table>
        <thead>
          <tr>
            <th>Job Type</th>
            <th>Queued Jobs</th>
          </tr>
        </thead>
        <tbody>
          {queueDepth.map((queue) => (
            <tr key={queue.type}>
              <td>{queue.type} </td>
              <td>{queue.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
