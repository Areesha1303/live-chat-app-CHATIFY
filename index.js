const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Initialize the express app
const app = express();

// Create an HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Frontend URL
        methods: ["GET", "POST"]
    }
});

// Use CORS middleware
app.use(cors());

// Initialize the users object
const users = {};

// Handle new connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for a new user joining
    socket.on('new-user-joined', (name) => {
        users[socket.id] = name; // Store the user's name with their socket ID
        socket.broadcast.emit('user-joined', name); // Notify others that a new user has joined
    });

    // Listen for messages being sent
    socket.on('send', (message) => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]); // Notify others that the user has left
        delete users[socket.id]; // Remove the user from the users object
    });
});

// Start the server on port 8000
server.listen(8000, () => {
    console.log('Server is running on port 8000');
});
