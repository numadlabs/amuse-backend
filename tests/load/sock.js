import ws from "k6/ws";
import { check } from "k6";

const socketUrl = `ws://localhost:3001/socket.io/?EIO=4&transport=websocket`;

export default function () {
  var res = ws.connect(socketUrl, null, function (socket) {
    socket.on("open", function open() {
      console.log("connected");
    });

    socket.on("message", function (message) {
      console.log("Received message: " + message);

      if (message === "40") {
        socket.send("40");
      }

      if (message[0] === "0") {
        socket.send("40");
      }

      if (message.startsWith("40") && message.length > 2) {
        socket.send('42["register", "gombochir"]');
      }

      if (message.startsWith("42")) {
        const data = JSON.parse(message.slice(2));

        const event = data[0];
        const payload = data[1];

        console.log(`event: ${data[0]}, payload: ${payload}`);
      }
    });

    socket.on("close", function () {
      console.log("disconnected");
    });

    socket.on("error", function (e) {
      console.error("Socket error:", e);
    });

    socket.setTimeout(function () {
      console.log("10 seconds passed, closing the socket");
      socket.close();
    }, 10000);
  });

  check(res, { "status is 101": (r) => r && r.status === 101 });
}
