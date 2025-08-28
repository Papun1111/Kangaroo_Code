// src/socket.js
const { Server } = require('socket.io');

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "https://kangaroo-code.vercel.app", // Your frontend URL
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
