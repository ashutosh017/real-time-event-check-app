import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

const connectedUsers = new Map<string, { id: string; name: string }>();

export function main() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);

    socket.on("register", (token: string) => {
      try {
        const user = jwt.verify(token, JWT_SECRET) as {
          id: string;
          name: string;
          email: string;
        };

        connectedUsers.set(socket.id, { id: user.id, name: user.name });
        console.log(` Registered user ${user.name} (${user.id})`);
      } catch (err) {
        console.warn(" Invalid token on register");
        socket.disconnect();
      }
    });

    socket.on("joinRoom", (eventId: string) => {
      const user = connectedUsers.get(socket.id);

      if (!user) {
        console.warn("Unauthorized joinRoom attempt");
        return;
      }

      socket.join(eventId);
      console.log(`👥 ${user.name} joined room ${eventId}`);

      socket.to(eventId).emit("userJoinedEvent", {
        eventId,
        userId: user.id,
        userName: user.name,
      });
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      console.log("❎ Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(3000);
  console.log("Socket.IO server running on port 3000");

  return io;
}
