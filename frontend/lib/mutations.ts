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
