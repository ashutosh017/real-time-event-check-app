import { JWT_SECRET } from "./config";
import { prisma } from "./db";
import jwt from "jsonwebtoken";
export const resolvers = {
  Query: {
    events: async (
      _parent: unknown,
      _args: unknown,
      context: { user?: { id: string } }
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const events = await prisma.event.findMany({
        include: {
          attendees: true,
        },
      });
      return events;
    },
    me: async (
      _parent: unknown,
      _args: unknown,
      context: {
        user?: {
          id: string;
        };
      }
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }
      const id = context.user.id;
      const user = await prisma.user.findFirst({
        where: {
          id,
        },
      });
      return user;
    },
  },
  Mutation: {
    joinEvent: async (
      _parent: unknown,
      { eventId }: { eventId: string },
      context: { user?: { id: string } }
    ) => {
      const user = context.user;
      if (!user || !user.id) {
        console.log("user: ",user)
        throw new Error("unauthorized");
      }
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          events: {
            connect: { id: eventId },
          },
        },
        include: {
          events: true,
        },
      });

      return updatedUser;
    },
    leaveEvent: async (
      _parent: unknown,
      { eventId }: { eventId: string },
      context: { user?: { id: string } }
    ) => {
      const user = context.user;
      if (!user || !user.id) {
        console.log("user: ",user)
        throw new Error("unauthorized");
      }
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          events: {
            disconnect: { id: eventId },
          },
        },
        include: {
          events: true,
        },
      });

      return updatedUser;
    },
    signup: async (
      _parent: unknown,
      {
        name,
        email,
        password,
      }: { name: string; email: string; password: string },
      _context: unknown
    ) => {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
        },
      });
      return user;
    },
    signin: async (
      _parent: unknown,
      { email, password }: { email: string; password: string },
      _context: unknown
    ) => {
      const user = await prisma.user.findFirst({
        where: {
          email,
          password,
        },
      });
      if (!user) return null;
      const token = jwt.sign(user.id, JWT_SECRET);
      return { token };
    },
  },
};
