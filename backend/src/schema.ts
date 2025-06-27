import { gql } from "apollo-server";

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String!
    password: String!
    email: String!
    events: [Event!]
  }

  type Event {
    id: String!
    name: String!
    location: String!
    startTime: Date!
    attendees: [User!]
  }

  type Query {
    events: [Event!]
    me: User
  }

  type AuthPayload {
    token: String!
  }

  type Mutation {
    joinEvent(eventId: String!): User
    leaveEvent(eventId: String!): User
    signup(name: String!, email: String!, password: String!): User!
    signin(email: String!, password: String!): AuthPayload!
  }
`;
