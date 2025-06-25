import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import jwt from "jsonwebtoken";
import { resolvers } from "./resolvers";
import { JWT_SECRET } from "./config";
interface UserPayload {
  email: string;
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    let user: UserPayload | null = null;

    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET) as UserPayload;
      } catch (err) {
        console.warn("Invalid token:", err);
      }
    }

    return { user };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
