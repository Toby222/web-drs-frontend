import { WebSocketServer } from "ws";

const port = 8989;
const wss = new WebSocketServer({ port: port });

console.log("listening on port: " + port);

wss.on("connection", function connection(ws) {
  ws.on("message", function (message) {
    console.log("message: " + message);
    ws.send(
      JSON.stringify({
        date: Date.now(),
        author: "ECHO Service",
        content: message.toString("utf-8"),
      })
    );
  });
  ws.on("close", function close() {
    console.log("closed a connection");
  });

  console.log("new client connected!");
  ws.send("connected!");
});
