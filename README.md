# Exam Microservice
Exam Microservice is a microservices-based application built with Node.js, gRPC, GraphQL, and REST, 
using SQLite as the database. It consists of three entities: User, Order, and Product. 
This README file provides an overview of the project and other relevant information.

## Table of Contents
Features
Technologies
Getting Started
Prerequisites
Usage
API Endpoints
Database
Contributing

## Features
Microservices architecture with gRPC, GraphQL, and REST
CRUD operations for User, Order, and Product entities
Communication between services using gRPC and RESTful APIs
GraphQL endpoint for flexible querying and data manipulation

## Technologies
Node.js
gRPC
GraphQL
RESTful APIs
SQLite

# Getting Started

## Prerequisites :
Node.js (version 16.14.0)
npm (version 8.5.2)
SQLite (version 5.1.6)
graphql (version 16.6.0)

## Installation :
download all files
Install the dependencies

## Usage : 
Start the microservices:
Start all microservices and the gateway in this order :
node orderMicroservice.js
node productMicroservice.js
node userMicroservice.js
node apiGateway.js
The microservices should now be running, and you can access them using the provided endpoints.

## API Endpoints :
GET /order: Retrieves all orders from the database.
GET /orders/:id: Retrieves a specific order by its ID.
GET /products/:id: Retrieves a specific product by its ID.
GET /products: Retrieves all products from the database.
POST /order: Creates a new order in the database.
POST /products: Creates a new product in the database.
PUT /order/:id: Updates a specific order by its ID.
PUT /product/:id: Updates a specific product by its ID.
DELETE /order/:id: Deletes a specific order by its ID.
DELETE /product/:id: Deletes a specific product by its ID.
GET /orders: Retrieves all orders from the database.
GET /users: Retrieves all users from the database.
GET /users/:id: Retrieves a specific user by its ID.
POST /user: Creates a new user in the database.
DELETE /user/:id: Deletes a specific user by its ID.

## Database :
The project uses SQLite as the database system. The SQLite database file can be found in the database directory.you can delete the database file and it will be recreated when starting the project.

## Contributing :
Contributions are welcome! If you find any issues or have suggestions for improvement, please submit an issue or a pull request. For major changes, please open an issue first to discuss potential changes.
