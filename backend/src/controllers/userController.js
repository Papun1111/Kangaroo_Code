// src/controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private
const getMe = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
const getUserProfile = async (req, res) => {
  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          include: {
            stats: true, // Fetch all match-level stats
          },
        },
        teamMemberships: {
          include: {
            team: {
              select: { id: true, name: true }
            },
          },
        },
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- DYNAMIC STATS CALCULATION ---
    // Calculate totals on the fly to ensure they are always accurate
    if (userProfile.profile && userProfile.profile.stats) {
        const stats = userProfile.profile.stats;
        
        const matchesPlayed = stats.length;
        const totalRuns = stats.reduce((sum, stat) => sum + (stat.runs || 0), 0);
        const totalBallsFaced = stats.reduce((sum, stat) => sum + (stat.ballsFaced || 0), 0);
        const totalWickets = stats.reduce((sum, stat) => sum + (stat.wickets || 0), 0);
        
        // Update the profile object we are about to send back
        userProfile.profile.matchesPlayed = matchesPlayed;
        userProfile.profile.wicketsTaken = totalWickets;
        
        // Batting Average: Total Runs / Matches Played (Simplified)
        userProfile.profile.battingAverage = matchesPlayed > 0 ? (totalRuns / matchesPlayed) : 0;

        // Strike Rate: (Total Runs / Total Balls Faced) * 100
        userProfile.profile.strikeRate = totalBallsFaced > 0 ? (totalRuns / totalBallsFaced) * 100 : 0;
    }
    // ---------------------------------

    // SECURITY FIX: Only allow the user to see their own email.
    if (req.user.id !== userProfile.id) {
        delete userProfile.email;
    }

    res.json(userProfile);
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users (for searching players)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}
const updateUserProfile = async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.id;

  try {
    const dataToUpdate = {};

    // Validate and check Username
    if (username) {
        if (username.trim().length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
        }
        // Check if taken by another user
        const userExists = await prisma.user.findFirst({
            where: { 
                username: { equals: username, mode: 'insensitive' },
                NOT: { id: userId }
            }
        });
        if (userExists) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }
        dataToUpdate.username = username;
    }

    // Validate and check Email
    if (email) {
        const emailExists = await prisma.user.findFirst({
            where: { 
                email: { equals: email, mode: 'insensitive' },
                NOT: { id: userId }
            }
        });
        if (emailExists) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }
        dataToUpdate.email = email;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No changes provided.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, username: true, email: true, role: true } 
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};
module.exports = {
  getUserProfile,
  getAllUsers,
  getMe,
updateUserProfile
};
