// import "./App.css";
import { QueueDepth } from "./components/queueDepth";

export default function App() {
  return (
    <main>
      <h1>Background Job Monitor</h1>

      <QueueDepth />

      {/* <InFlightJobs />

      <CompletedJobs />

      <FailedJobs />

      <Workers /> */}
    </main>
  );
}
