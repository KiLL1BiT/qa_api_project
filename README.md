# QA Learning API

## Overview
The **QA Learning API** is a Node.js-based RESTful API designed to provide a hands-on learning experience for quality assurance practices. It allows users to register, log in, and perform CRUD operations on user data. The API uses JSON Web Tokens (JWT) for authentication and is documented using Swagger for easy interaction and testing.

This project is aimed at helping new QA engineers understand the fundamentals of working with RESTful APIs, authentication, and essential CRUD operations.

## Features
- User registration with password hashing using **bcryptjs**.
- User login with JWT-based authentication.
- CRUD operations on user data (Create, Read, Update, Delete).
- Secure token-based endpoints for protected user data.
- Swagger UI integration for comprehensive API documentation and easy testing.

## Technologies Used
- **Node.js**: JavaScript runtime for server-side programming.
- **Express**: Minimalist web framework for building APIs.
- **Swagger**: API documentation tool integrated using **swagger-jsdoc** and **swagger-ui-express**.
- **JWT (jsonwebtoken)**: Used for generating and verifying authentication tokens.
- **bcryptjs**: Library for hashing passwords.

## Getting Started
### Prerequisites
- **Node.js** and **npm** installed on your system.

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qa_api_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Running the Server
To start the server, run:
```bash
node server.js
```
The server will run on **http://localhost:3000** by default.

### Swagger Documentation
The Swagger documentation can be accessed at:
- **URL**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Swagger provides an interactive UI to explore and test the different API endpoints.

## API Endpoints
### User Management
- **POST /api/register**: Register a new user by providing a username and password. The password will be securely hashed before storing.
- **POST /api/login**: Log in with a username and password. If successful, a JWT token will be provided.
- **GET /api/users**: Retrieve a list of registered users (requires valid JWT token).
- **GET /api/users/{id}**: Retrieve a specific user by their unique ID.
- **PUT /api/users/{id}**: Update the details of an existing user by providing their ID.
- **PATCH /api/users/{id}**: Partially update user information by ID.
- **DELETE /api/users/{id}**: Delete a user by their unique ID.

## Authentication
The API uses **JWT tokens** for authentication. To access protected routes (e.g., **GET /api/users**), you need to include an `Authorization` header with the value `Bearer <your_token>`.

### Example
To access the list of users after logging in:
```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:3000/api/users
```


