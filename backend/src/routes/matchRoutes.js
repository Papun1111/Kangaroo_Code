// src/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMatch,
  getAllMatches,
  getMatchById,
  updateScore,
  startNextInnings,
  updateToss
} = require('../controllers/matchController.js');
const { protect, isCaptain, isUmpire } = require('../middleware/authMiddleware.js');

router.route('/').post(protect, isCaptain, createMatch).get(getAllMatches);
router.route('/:id').get(getMatchById);
router.route('/:matchId/score').post(protect, isCaptain, updateScore);
router.route('/:matchId/toss')
    .post(protect, isCaptain, updateToss);

router.route('/:matchId/start-innings')
    .post(protect, isCaptain, startNextInnings);

module.exports = router;
