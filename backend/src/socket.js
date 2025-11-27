// src/socket.js
const { Server } = require('socket.io');
const dotenv=require("dotenv");
dotenv.config();
let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL, // Your frontend URL
            methods: ["GET", "POST"]
        }
    });
    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { initSocket, getIO };
