// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser,googleAuth } = require('../controllers/authController.js');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth); // New Route
module.exports = router;
