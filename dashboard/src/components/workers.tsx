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
    <section>
      <h2>Workers</h2>
      <table>
        <thead>
          <tr>
            <th>Worker ID</th>
            <th>Status</th>
            <th>Last Heartbeat</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.id}>
              <td>{worker.id}</td>
              <td>
                <span
                  style={{
                    color: worker.status === "alive" ? "green" : "red",
                    fontWeight: "normal",
                  }}
                >
                  {worker.status}
                </span>
              </td>

              <td>{new Date(worker.lastHeartbeat).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
