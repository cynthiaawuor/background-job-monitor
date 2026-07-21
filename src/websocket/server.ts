import type { Server as HttpServer } from "node:http";
import { WebSocketServer } from "ws";

let webSocketServer: WebSocketServer;

export const startWebSocketServer = (server: HttpServer) => {
  webSocketServer = new WebSocketServer({ server });
  webSocketServer.on("connection", (socket) => {
    socket.send(
      JSON.stringify({
        type: "connected",
        message: "Welcome to background job monitor",
      }),
    );
    console.log("Dashboard connected");

    socket.on("close", () => {
      console.log("Dashboard disconnected");
    });
  });
  console.log("WebSocket server attached to HTTP server");
};

export const broadcast = (payload: unknown) => {
  if (!webSocketServer) {
    return;
  }
  const message = JSON.stringify(payload);

  webSocketServer.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};
