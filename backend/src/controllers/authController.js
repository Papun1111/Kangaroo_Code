// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const prisma = new PrismaClient();

/**
 * @desc    Register a new user and create their player profile.
 * @route   POST /api/auth/register
 * @access  Public
 */

const googleAuth = async (req, res) => {
  const { credential } = req.body;

  try {
    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub } = payload; // sub is the unique Google ID

    // 2. Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // 3. If new user, create them. 
      // We generate a random password since they use Google to login.
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      // Generate a unique username based on their name or email
      let baseUsername = name.split(' ').join('').toLowerCase() || email.split('@')[0];
      // Append random number to ensure uniqueness
      let username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Ensure username is truly unique (simple check)
      let usernameExists = await prisma.user.findUnique({ where: { username } });
      while(usernameExists) {
         username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
         usernameExists = await prisma.user.findUnique({ where: { username } });
      }

      // Create User and Profile transaction
      user = await prisma.$transaction(async (prisma) => {
        const newUser = await prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
          },
        });

        await prisma.playerProfile.create({
          data: {
            userId: newUser.id,
          },
        });

        return newUser;
      });
    }

    // 4. Return the same response structure as standard login
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
};
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user already exists
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (userExists) {
      return res.status(400).json({ message: 'A user with that email or username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      await prisma.playerProfile.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    // Respond with user data and token
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc    Authenticate a user and return a token.
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if user exists and password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth
};
