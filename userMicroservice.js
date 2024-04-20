const sqlite3 = require('sqlite3').verbose(); // Import SQLite3 module for database operations
const grpc = require('@grpc/grpc-js'); // Import gRPC module
const protoLoader = require('@grpc/proto-loader'); // Import protoLoader for loading protobuf files

// Load user.proto file
const userProtoPath = 'user.proto';
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;

// Connect to SQLite database
const db = new sqlite3.Database('./database.db'); 

// Create a table for users if it doesn't exist already
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT,
    order_ids TEXT
  )
`);

// Example function to retrieve order details from the database
function getOrderByIdFromDatabase(orderId) {
  console.log("getOrderByIdFromDatabase");
  console.log(orderId);
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        const order = {
          id: row.id,
          title: row.title,
          description: row.description,
        };
        resolve(order);
      } else {
        reject(new Error('Order not found'));
      }
    });
  });
}

// Define user service with gRPC methods
const userService = {
  // Method to get user by ID
  getUser: (call, callback) => {
    const { user_id } = call.request;
    // Execute SQL query to fetch user from database by ID
    db.get('SELECT * FROM users WHERE id = ?', [user_id], (err, row) => {
      if (err) {
        callback(err);
      } else if (row) {
        // If user found, construct user object and send it as response
        const user = {
          id: row.id,
          username: row.username,
          password: row.password,
          email: row.email,
          order_ids: row.order_ids,
        };
        callback(null, { user });
      } else {
        // If user not found, return an error
        callback(new Error('User not found'));
      }
    });
  },
  // Method to search users
  searchUsers: (call, callback) => {
    // Execute SQL query to fetch all users from database
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) {
        callback(err);
      } else {
        // If users found, construct array of user objects and send it as response
        const users = rows.map(async (row) => {
          const orderIds = JSON.parse(row.order_ids); // Parse order_ids JSON string
          const orders = await Promise.all(orderIds.map((orderId) => getOrderByIdFromDatabase(orderId))); // Fetch order details for each orderId
        
          return {
            id: row.id,
            username: row.username,
            password: row.password,
            email: row.email,
            orders: orders // Include the fetched order details in the user object
          };
        });
        callback(null, { users });
      }
    });
  },
  // Method to create a new user
  CreateUser: (call, callback) => {
    const { user_id, username, password, email, order_ids } = call.request;
    // Execute SQL query to insert new user into database
    db.run(
      'INSERT INTO users (id, username, password, email, order_ids) VALUES (?, ?, ?, ?, ?)',
      [user_id, username, password, email, order_ids],
      function (err) {
        if (err) {
          callback(err);
        } else {
          // If user created successfully, construct user object and send it as response
          const user = {
            id: user_id,
            username, 
            password, 
            email,
            order_ids
          };
          callback(null, { user });
        }
      }
    );
  },
};

// Create gRPC server and bind user service to it
const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);

// Define the port to run the server on
const port = 50053;

// Start the gRPC server
server.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`Server is running on port ${port}`);
  server.start();
});

console.log(`User microservice running on port ${port}`);
