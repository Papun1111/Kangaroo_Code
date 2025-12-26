// src/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTeam,
  getAllTeams,
  getTeamById,
  addPlayerToTeam,
  removePlayerFromTeam,
  updateTeamLogo
} = require('../controllers/teamController');
const { protect, isCaptain } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTeam)
    .get(getAllTeams);

// All routes pertaining to a specific team will use /:id as the team identifier
router.route('/:id')
    .get(getTeamById);

router.route('/:id/players')
    .post(protect, isCaptain, addPlayerToTeam);

router.route('/:id/players/:playerId')
    .delete(protect, isCaptain, removePlayerFromTeam);
router.route('/:id/logo')
    .put(protect, isCaptain, updateTeamLogo);
module.exports = router;
