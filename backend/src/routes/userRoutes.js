// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers } = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.get('/', protect, getAllUsers);
router.get('/profile/:id', protect, getUserProfile);

module.exports = router;
