const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(express.json());

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QA Learning API',
            version: '1.0.0',
            description: 'The QA Learning API is designed to provide a hands-on learning experience for quality assurance practices. It features user management operations, including user registration, login with token-based authentication, and the ability to retrieve, update, and delete users. The API helps new QA engineers understand the fundamentals of working with RESTful APIs, security practices such as authentication, and essential CRUD operations.'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ]
    },
    apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mock user database
let users = [];
let nextUserId = 1;

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user by providing a username and password. The password will be securely hashed before storing it in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 */
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: nextUserId++, username, password: hashedPassword };
    users.push(newUser);
    res.status(201).json({ id: newUser.id, username: newUser.username });
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user and generate an auth token
 *     description: Log in by providing a username and password. If the credentials are correct, an authentication token (JWT) will be returned, which can be used to access protected routes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, token generated
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find((user) => user.username === username);
    if (!user) {
        return res.status(401).send('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns a list of users
 *     description: Retrieve a list of registered users. This endpoint requires a valid authentication token to access.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *
 *     example usage:
 *       To perform a GET request with an auth token, you need to include an `Authorization` header with the value `Bearer <your_token>`. Here is an example curl command:
 *       ```bash
 *       curl -H "Authorization: Bearer <your_token>" http://localhost:3000/api/users
 *       ```
 */
app.get('/api/users', authenticateToken, (req, res) => {
    res.json(users.map((user) => ({ id: user.id, username: user.username })));
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).send('Unauthorized');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Forbidden');
        req.user = user;
        next();
    });
}

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a specific user by their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *       404:
 *         description: User not found
 */
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find((user) => user.id === parseInt(id));
    if (user) {
        res.json({ id: user.id, username: user.username });
    } else {
        res.status(404).send('User not found');
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     description: Update the details of an existing user by providing their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const user = users.find((user) => user.id === parseInt(id));
    if (user) {
        user.username = name;
        res.send(`User ${id} updated to ${name}`);
    } else {
        res.status(404).send('User not found');
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Partially update a user by ID
 *     description: Partially update the details of an existing user by providing their ID. Only the fields specified in the request body will be updated.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const user = users.find((user) => user.id === parseInt(id));
    if (user) {
        if (name) {
            user.username = name;
        }
        res.send(`User ${id} partially updated to ${name}`);
    } else {
        res.status(404).send('User not found');
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a user from the database by providing their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((user) => user.id === parseInt(id));
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.send(`User ${id} deleted successfully`);
    } else {
        res.status(404).send('User not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});