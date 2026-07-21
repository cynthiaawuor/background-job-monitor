import type { Worker } from "../types/worker";

export type WsJob = {
  id: string;
  type: string;
  workerId: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  stackTrace: string | null;
};

export type WsMessage =
  | { type: "connected"; message: string }
  | { type: "job.enqueued"; job: WsJob }
  | { type: "job.claimed"; claimedJob: WsJob }
  | { type: "job.completed"; updatedJob: WsJob }
  | { type: "job.failed"; updatedJob: WsJob }
  | { type: "job.reclaimed"; job: WsJob }
  | { type: "worker.updated"; worker: Worker };

const WS_URL = "ws://localhost:3000";
const RECONNECT_DELAY_MS = 2000;

export const connectWebSocket = (onMessage: (message: WsMessage) => void) => {
  let socket: WebSocket;
  let closedByCaller = false;

  const connect = () => {
    socket = new WebSocket(WS_URL);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as WsMessage;
      onMessage(message);
    };

    socket.onclose = () => {
      if (!closedByCaller) {
        setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };
  };

  connect();

  return () => {
    closedByCaller = true;
    socket.close();
  };
};
