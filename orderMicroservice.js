// Import required modules
const sqlite3 = require('sqlite3').verbose(); // SQLite library for database operations
const grpc = require('@grpc/grpc-js'); // gRPC library
const protoLoader = require('@grpc/proto-loader'); // Protocol Buffers loader for gRPC

// Define path to the Protocol Buffers file
const orderProtoPath = 'order.proto';

// Load the Protocol Buffers file
const orderProtoDefinition = protoLoader.loadSync(orderProtoPath, {
  keepCase: true, // Keep field names in their original case
  longs: String, // Convert Long values to strings
  enums: String, // Convert enum values to strings
  defaults: true, // Populate default values for missing fields
  oneofs: true, // Treat oneof fields as separate properties
});

// Load the gRPC package definition
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;

// Create a SQLite database instance
const db = new sqlite3.Database('./database.db'); 

// Create a table for orders if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Define gRPC service functions
const orderService = {
  // Function to retrieve a order by ID
  getOrder: (call, callback) => {
    const { order_id } = call.request;
    
    // Query the database for the order with the provided ID
    db.get('SELECT * FROM orders WHERE id = ?', [order_id], (err, row) => {
      if (err) {
        callback(err); // Return error if query fails
      } else if (row) {
        // If order exists, construct order object and return it
        const order = {
          id: row.id,
          title: row.title,
          description: row.description,
        };
        callback(null, { order });
      } else {
        // If order doesn't exist, return an error
        callback(new Error('Order not found'));
      }
    });
  },
  // Function to retrieve all orders
  searchOrders: (call, callback) => {
    // Query the database to retrieve all orders
    db.all('SELECT * FROM orders', (err, rows) => {
      if (err) {
        callback(err); // Return error if query fails
      } else {
        // If successful, construct an array of order objects and return it
        const orders = rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
        }));
        callback(null, { orders });
      }
    });
  },
  // Function to create a new order
  CreateOrder: (call, callback) => {
    const { order_id, title, description } = call.request;
    // Insert the new order into the database
    db.run(
      'INSERT INTO orders (id, title, description) VALUES (?, ?, ?)',
      [order_id, title, description],
      function (err) {
        if (err) {
          callback(err); // Return error if insertion fails
        } else {
          // If successful, construct the new order object and return it
          const order = {
            id: order_id,
            title,
            description,
          };
          callback(null, { order });
        }
      }
    );
  },
};

// Create a gRPC server
const server = new grpc.Server();

// Add the order service to the server
server.addService(orderProto.OrderService.service, orderService);

// Define the port number for the server
const port = 50051;

// Bind the server to the specified port and start it
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });

// Log a message indicating that the order microservice is running on the specified port
console.log(`Order microservice running on port ${port}`);
