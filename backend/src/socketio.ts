import { createServer } from "http";
import { Server } from "socket.io";

export function main() {
  const httpServer = createServer();
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("message", (ev) => {
      console.log("event data: ", ev.data);
    });
  });

  httpServer.listen(3000);
}
