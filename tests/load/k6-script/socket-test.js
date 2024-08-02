import ws from "k6/ws";
import { check } from "k6";

export default function () {
  const url = "ws://localhost:3001"; // Replace with your WebSocket server URL
  const connection = ws.connect(url, null, function (socket) {
    console.log("Connected to WebSocket server");

    // Handle incoming messages
    socket.on("message", function (message) {
      console.log(`Received message: ${message}`);
    });

    // Emit a message after the connection is established
    socket.send("Hello, server!");

    // Optional: handle connection close
    socket.on("close", function () {
      console.log("Disconnected from WebSocket server");
    });

    // Optional: handle connection errors
    socket.on("error", function (error) {
      console.error(`WebSocket error: ${error}`);
    });

    // Optional: close the connection after some time
    setTimeout(() => {
      socket.close();
    }, 10000); // Close after 10 seconds
  });

  check(connection, {
    "WebSocket connection established": (conn) => conn !== null,
  });
}
