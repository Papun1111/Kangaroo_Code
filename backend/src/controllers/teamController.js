// src/controllers/teamController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Create a new team, making the creator the captain.
 * @route   POST /api/teams
 * @access  Private
 */
const createTeam = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Please provide a team name' });
  }

  try {
    // Check if team name is already taken
    const existingTeam = await prisma.team.findUnique({ where: { name } });
    if (existingTeam) {
        return res.status(400).json({ message: 'Team name is already taken' });
    }

    // Create team and set user as captain in a transaction
    const team = await prisma.$transaction(async (prisma) => {
        const newTeam = await prisma.team.create({
            data: {
                name,
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'CAPTAIN',
                    },
                },
            },
        });

        await prisma.user.update({
            where: { id: req.user.id },
            data: { role: 'CAPTAIN' }
        });

        return newTeam;
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Create Team Error:', error);
    res.status(500).json({ message: 'Server error while creating team' });
  }
};

/**
 * @desc    Get a list of all teams.
 * @route   GET /api/teams
 * @access  Public
 */
const getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
        include: {
            _count: {
                select: { members: true }
            }
        }
    });
    res.json(teams);
  } catch (error) {
    console.error('Get All Teams Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get detailed information for a single team by ID.
 * @route   GET /api/teams/:id
 * @access  Public
 */
const getTeamById = async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error('Get Team By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Add a player to a team.
 * @route   POST /api/teams/:id/players
 * @access  Private (Captain only)
 */
const addPlayerToTeam = async (req, res) => {
  const { userId } = req.body;
  const { id: teamId } = req.params; // Gets team ID from URL parameter named 'id'

  if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Check if the current user is the captain of the team
    const membership = await prisma.teamMembership.findFirst({
        where: { teamId: teamId, userId: req.user.id, role: 'CAPTAIN' }
    });

    if (!membership) {
        return res.status(403).json({ message: 'Only the team captain can add players.' });
    }

    // Add the new member
    const newMember = await prisma.teamMembership.create({
      data: { userId, teamId, role: 'PLAYER' },
    });

    res.status(201).json(newMember);
  } catch (error) {
    console.error('Add Player Error:', error);
    // Handle unique constraint violation (player already in team)
    if (error.code === 'P2002') {
        return res.status(400).json({ message: 'This player is already in the team.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Remove a player from a team.
 * @route   DELETE /api/teams/:id/players/:playerId
 * @access  Private (Captain only)
 */
const removePlayerFromTeam = async (req, res) => {
    const { id: teamId, playerId } = req.params; // CORRECTED: Reads 'id' as teamId

    try {
        // Verify user is captain
        const captainMembership = await prisma.teamMembership.findFirst({
            where: { teamId: teamId, userId: req.user.id, role: 'CAPTAIN' }
        });
        if (!captainMembership) {
            return res.status(403).json({ message: 'Only the team captain can remove players.' });
        }

        // Prevent captain from removing themselves
        if (req.user.id === playerId) {
            return res.status(400).json({ message: "Captain cannot remove themselves. Transfer captaincy first." });
        }

        // Delete the membership
        await prisma.teamMembership.delete({
            where: {
                userId_teamId: {
                    userId: playerId,
                    teamId: teamId
                }
            }
        });

        res.status(200).json({ message: 'Player removed successfully' });

    } catch (error) {
        console.error('Remove Player Error:', error);
        if (error.code === 'P2025') { // Record to delete does not exist
            return res.status(404).json({ message: 'Player not found in this team.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  addPlayerToTeam,
  removePlayerFromTeam,
};
