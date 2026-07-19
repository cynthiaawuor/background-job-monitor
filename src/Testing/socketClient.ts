import WebSocket from "ws";

const socket = new WebSocket("ws://localhost:3001");

socket.on("open", () => {
  console.log("connected");
});

socket.on("message", (message) => {
  console.log(message.toString());
});

socket.on("close", () => {
  console.log("Disconnected");
});
