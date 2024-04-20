const sqlite3 = require('sqlite3').verbose();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the Protocol Buffer definition for the product service
const productProtoPath = 'product.proto';
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;

// Define the product service implementation
const productService = {
  getProduct: (call, callback) => {
    // Create a mock product object
    const notif = {
      id: call.request.product_id,
      title: 'product ex',
      description: 'This is an example product.',
    };
    // Send the product object as response
    callback(null, { notif });
  },
};

// Create a gRPC server
const server = new grpc.Server();

// Add the product service to the server
server.addService(productProto.ProductService.service, productService);

const port = 50052;
// Connect to SQLite database
let db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log('Database connected.');
});

// Create a table for products if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Bind the server to the specified port and start it
server.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }

  console.log(`Server is running on port ${port}`);
  server.start();
});
console.log(`Product microservice running on port ${port}`);
