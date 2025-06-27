import { gql } from "graphql-request";

export const SIGN_UP = gql`
  mutation ($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export const SIGN_IN = gql`
  mutation ($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      token
    }
  }
`;

export const GET_ALL_EVENTS = gql`
  query {
    events {
      id
      name
      location
      startTime
      attendees {
        id
        name
      }
    }
  }
`;

export const JOIN_EVENT = gql`
  mutation ($eventId: String!) {
    joinEvent(eventId: $eventId) {
      id
      name
      email
    }
  }
`;
export const LEAVE_EVENT = gql`
  mutation ($eventId: String!) {
    leaveEvent(eventId: $eventId) {
      id
      name
      email
    }
  }
`;

export const GET_ME = gql`
  query {
    me {
      id
      name
      email
    }
  }
`;
