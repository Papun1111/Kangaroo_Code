// src/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes.js');
const teamRoutes = require('./routes/teamRoutes.js');
const matchRoutes = require('./routes/matchRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinMatch', (matchId) => {
    socket.join(matchId);
    console.log(`User ${socket.id} joined match ${matchId}`);
  });

  socket.on('updateScore', (data) => {
    // Here you would typically validate the update and save to DB
    // Then broadcast the new score to all clients in the match room
    io.to(data.matchId).emit('scoreUpdated', data.scoreData);
    console.log('Score updated for match:', data.matchId);
  });
  
  socket.on('updateCommentary', (data) => {
    io.to(data.matchId).emit('newCommentary', data.commentary);
    console.log('New commentary for match:', data.matchId);
  });


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));