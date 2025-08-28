// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Protect routes by verifying JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload and attach to request
      // Exclude the password from the user object
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, email: true, role: true },
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Middleware to check if user is a Captain or Admin
const isCaptain = (req, res, next) => {
    if (req.user && (req.user.role === 'CAPTAIN' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Requires Captain or Admin role.' });
    }
};

// Middleware to check if user is an Umpire or Admin
const isUmpire = (req, res, next) => {
    if (req.user && (req.user.role === 'UMPIRE' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Requires Umpire or Admin role.' });
    }
};


module.exports = { protect, isCaptain, isUmpire };
