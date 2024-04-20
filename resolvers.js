// Import required modules
const sqlite3 = require('sqlite3').verbose(); // SQLite library for database operations

// Define path to Protocol Buffers files
const orderProtoPath = 'order.proto';
const productProtoPath = 'product.proto';
const userProtoPath = 'user.proto';

// Import gRPC and Protocol Buffers loader
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load Protocol Buffers definitions for order, product, and user services
const orderProtoDefinition = protoLoader.loadSync(orderProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load gRPC package definitions for order, product, and user services
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;

// Create gRPC clients for order, product, and user services
const clientOrders = new orderProto.OrderService('127.0.0.1:50051', grpc.credentials.createInsecure());
const clientProducts = new productProto.ProductService('127.0.0.1:50052', grpc.credentials.createInsecure());
const userOrders = new userProto.UserService('127.0.0.1:50053', grpc.credentials.createInsecure());

// Create a SQLite database instance
const db = new sqlite3.Database('./database.db');

// Define resolvers for GraphQL queries and mutations
const resolvers = {
  Query: {
    // Resolver function to get a order by ID
    order: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    // Resolver function to get all orders
    orders: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM orders', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    // Resolver function to get a product by ID
    product: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    // Resolver function to get all products
    products: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    // Resolver function to get a user by ID
    user: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    // Resolver function to get all users
    users: () => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
  },

  Mutation: {
    // Resolver function to create a new order
    CreateOrder: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO orders (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },

    // Resolver function to create a new product
    CreateProduct: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO products (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },

    // Resolver function to update a order
    UpdateOrder: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE orders SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },

    // Resolver function to update a product
    UpdateProduct: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE products SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },

    // Resolver function to delete a order
    DeleteOrder: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },

    // Resolver function to delete a product
    DeleteProduct: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },

    // Resolver function to create a new user
    CreateUser: (_, { id, username, password, email, order_ids }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, username, password, email, order_ids) VALUES (?, ?, ?, ?, ?)',
          [id, username, password, email, order_ids],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, username, password, email, order_ids });
            }
          }
        );
      });
    },

    // Resolver function to update a user
    UpdateUser: (_, { id, username, password, email }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?',
          [username, password, email, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, username, password, email });
            }
          }
        );
      });
    },
    
    // Resolver function to delete a user
    DeleteUser: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      });
    },
  },
};

// Export resolvers for use in Apollo Server
module.exports = resolvers;
