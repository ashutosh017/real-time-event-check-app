import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "./db";
import { JWT_SECRET } from "./config";

const connectedUsers = new Map<string, { id: string; name: string }>();

export default function socketServer() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);

    socket.on("register", async (token: string) => {
      try {
        token = token.replace("Bearer ", "");
        console.log("token: ", token);
        const userId = jwt.verify(token, JWT_SECRET) as {
          id: string;
        };
        const user = await prisma.user.findFirst({ where: { id: userId.id } });
        if (!user) {
          throw new Error("user not found");
        }
        connectedUsers.set(socket.id, { id: userId.id, name: user.name });
        console.log(` Registered user ${user.name} (${user.id})`);
      } catch (err) {
        console.warn(" Invalid token on register");
        console.log(err);
        socket.disconnect();
      }
    });

    socket.on(
      "joinEvent",
      async ({ eventId, id }: { eventId: string; id: string }) => {
        console.log("join event");
        const user = await prisma.user.findFirst({ where: { id } });

        if (!user) {
          console.warn("Unauthorized joinRoom attempt");
          return;
        }

        socket.join(eventId);
        console.log(`👥 ${user.name} joined room ${eventId}`);

        io.emit("userJoinedEvent", {
          eventId,
          userId: id,
          name: user.name,
        });
      }
    );
    socket.on(
      "leaveRoom",
      async ({ eventId, id }: { eventId: string; id: string }) => {
        console.log("leave event");
        const user = await prisma.user.findFirst({ where: { id } });
        if (!user) {
          console.warn("Unauthorized leave room attempt");
          return;
        }

        socket.join(eventId);
        console.log(`👥 ${user.name} left room ${eventId}`);

        io.emit("userLeftEvent", {
          eventId,
          userId: id,
          userName: user.name,
        });
      }
    );

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      console.log("❎ Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(3000);
  console.log("Socket.IO server running on port 3000");

  return io;
}
