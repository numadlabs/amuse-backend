import ws from "k6/ws";
import { check } from "k6";

export default function () {
  const token = "....token...";
  const url = `ws://localhost:3001/socket.io/?EIO=3&transport=websocket`;

  var response = ws.connect(url, {}, function (socket) {
    socket.on("open", function open() {
      console.log("connected");
      // socket.send(Date.now());

      socket.setInterval(function timeout() {
        socket.ping();
        console.log("Pinging every 5sec (setInterval test)");
      }, 1000 * 5);
    });

    socket.on("message", function incoming(msg) {
      // console.log(msg);
      if (msg === "40") {
        socket.send("40");
      }

      socket.send(`42["register","gombochir"]`);
      socket.send(`42/,["register","gombochir"]`);

      //   if (msg === "40/chat") {
      //     socket.send('42/chat,["ACTION_1",{"data": "x"}]');
      //   }

      if (msg && msg.startsWith("42,")) {
        const data = JSON.parse(msg.substring("42,".length));
        console.log(data);
        const action = data[0];
        console.log(`received msg: ${action}`);

        // waiting for specific action and responding to it
        if (action === "ACTION_X") {
          const chatMsg = `k6 hello, vu=${__VU}, iter=${__ITER}, ${Date.now().toString()}`;
          socket.send(`42/chat,["MESSAGE_ACTION",{"message": "${chatMsg}"}]`);
        }
      }
    });

    socket.on("close", function close() {
      console.log("disconnected");
    });

    socket.on("error", function (e) {
      console.log("error", e);
      if (e.error() != "websocket: close sent") {
        console.log("An unexpected error occured: ", e.error());
      }
    });

    socket.setTimeout(function () {
      console.log("60 seconds passed, closing the socket");
      socket.close();
    }, 1000 * 60);
  });

  check(response, { "status is 101": (r) => r && r.status === 101 });
}
