const { gql } = require('@apollo/server');

// Define GraphQL schema using GraphQL Schema Definition Language (SDL)
const typeDefs = `#graphql
  type Order {
    id: String!
    title: String!
    description: String!
  }

  type Product {
    id: String!
    title: String!
    description: String!
  }

  type User {
    id: String!
    username: String!
    password: String!
    email: String!
    order_ids: [String!]
  }

  type Query {
    order(id: String!): Order
    orders: [Order]
    product(id: String!): Product
    products: [Product]
    user(id: String!): User
    users: [User]
  }

  type Mutation {
    CreateOrder(id: String!, title: String!, description:String!): Order
    CreateProduct(id: String!, title: String!, description:String!): Product
    UpdateOrder(id: String!, title: String!, description:String!): Order
    UpdateProduct(id: String!, title: String!, description:String!): Product
    DeleteOrder(id: String!): Order
    DeleteProduct(id: String!): Product
    CreateUser(id: String!, username: String!, password: String!, email: String!, order_ids: [String!]): User
    UpdateUser(id: String!, username: String!, password: String!, email: String!): User
    DeleteUser(id: String!): User
  }
`;

module.exports = typeDefs