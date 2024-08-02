const { io } = require("socket.io-client");

export const client = io("http://localhost:3001", {
  transports: ["websocket"],
});
