// Import required modules
const sqlite3 = require('sqlite3').verbose(); // SQLite library for database operations
const express = require('express'); // Express framework for building APIs
const { ApolloServer } = require('@apollo/server'); // Apollo Server for GraphQL
const { expressMiddleware } = require('@apollo/server/express4'); // Apollo Server middleware for Express
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const cors = require('cors'); // Middleware for enabling CORS (Cross-Origin Resource Sharing)
const grpc = require('@grpc/grpc-js'); // gRPC library
const protoLoader = require('@grpc/proto-loader'); // Protocol Buffers loader for gRPC

// Define paths to Protocol Buffers files
const orderProtoPath = 'order.proto';
const productProtoPath = 'product.proto';
const userProtoPath = 'user.proto';

// Import resolvers and typeDefs for Apollo Server
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Create a SQLite database instance
const db = new sqlite3.Database('./database.db'); 

// Create an Express application instance
const app = express();

// Configure middleware
app.use(bodyParser.json()); // Parse request bodies as JSON
app.use(cors()); // Enable CORS for all routes

// Load Protocol Buffers definitions for gRPC services
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

// Load gRPC package definitions
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;

// Create gRPC clients for each service
const clientOrders = new orderProto.OrderService('127.0.0.1:50051', grpc.credentials.createInsecure());
const clientProducts = new productProto.ProductService('127.0.0.1:50052', grpc.credentials.createInsecure());
const userOrders = new userProto.UserService('127.0.0.1:50053', grpc.credentials.createInsecure());

// Create an Apollo Server instance with resolvers and typeDefs
const server = new ApolloServer({ typeDefs, resolvers });

// Start Apollo Server and integrate it with Express
server.start().then(() => {
  app.use(
    expressMiddleware(server) // Integrate Apollo Server middleware with Express
  );
});

// Define routes for handling RESTful API requests
app.get('/order', (req, res) => {
  db.all('SELECT * FROM orders', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
});

app.get('/orders/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('Order not found.');
    }
  });
});

app.get('/products/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('Product not found.');
    }
  });
});

app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
}
);

app.post('/order', (req, res) => {
  const { id, title, description } = req.body;
  db.run(
    'INSERT INTO orders (id, title, description) VALUES (?, ?, ?)',
    [id, title, description],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id, title, description });
      }
    }
  );
});

app.post('/products', (req, res) => {
  const { id, title, description } = req.body;
  db.run(
    'INSERT INTO products (id, title, description) VALUES (?, ?, ?)',
    [id, title, description],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id, title, description });
      }
    }
  );
});

app.put('/order/:id', (req, res) => {
  const { title, description } = req.body;
  const orderId = req.params.id;
  db.run(
    'UPDATE orders SET title = ?, description = ? WHERE id = ?',
    [title, description, orderId],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id: orderId, title, description });
      }
    }
  );
});

app.put('/product/:id', (req, res) => {
  const { title, description } = req.body;
  const productId = req.params.id;
  db.run(
    'UPDATE products SET title = ?, description = ? WHERE id = ?',
    [title, description, productId],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id: productId, title, description });
      }
    }
  );
});

app.delete('/order/:id', (req, res) => {
  const orderId = req.params.id;
  db.run(
    'DELETE FROM orders WHERE id = ?',
    orderId,
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

app.delete('/product/:id', (req, res) => {
  const productId = req.params.id;
  db.run(
    'DELETE FROM products WHERE id = ?',
    productId,
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

app.get('/orders', (req, res) => {
  db.all('SELECT * FROM orders', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
}
);

app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(rows);
    }
  });
});

app.get('/users/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).send(err);
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).send('User not found.');
    }
  });
});


app.post('/user', (req, res) => {
  const { id, username, password, email, order_ids } = req.body;
  db.run(
    'INSERT INTO users (id, username, password, email, order_ids) VALUES (?, ?, ?, ?, ?)',
    [id, username, password, email, order_ids],
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id, username, password, email, order_ids });
      }
    }
  );
});

app.delete('/user/:id', (req, res) => {
  const userId = req.params.id;
  db.run(
    'DELETE FROM users WHERE id = ?',
    userId,
    function (err) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    }
  );
});

// Define the port for the Express application
const port = 3000;

// Start the Express application and listen on the specified port
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
