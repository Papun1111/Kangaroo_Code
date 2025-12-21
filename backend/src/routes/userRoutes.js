// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers ,getMe,updateUserProfile} = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');


router.get('/me', protect, getMe);
router.get('/', protect, getAllUsers);
router.get('/profile/:id', protect, getUserProfile);
router.put('/update', protect, updateUserProfile);

module.exports = router;
