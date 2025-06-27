import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import jwt from "jsonwebtoken";
import { resolvers } from "./resolvers";
import { JWT_SECRET } from "./config";
import socketServer from "./socketio";

interface UserPayload {
  id: string;
}

socketServer();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    let userId: UserPayload | null = null;
    if (token) {
      try {
        userId = jwt.verify(token, JWT_SECRET) as UserPayload;
      } catch (err) {
        console.warn("Invalid token:", err);
      }
    }

    return {
      user: {
        id: userId,
      },
    };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
