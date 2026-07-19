import { type Server, WebSocketServer } from "ws";

let webSocketServer: Server;

export const startWebSocketServer = (port: number) => {
  webSocketServer = new WebSocketServer({ port });
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
  console.log(`WebSocket server running on ws://localhost:${port}`);
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
