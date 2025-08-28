// src/controllers/matchController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../socket.js'); // Import the getIO function


const createMatch = async (req, res) => {
  const { venue, matchDate, homeTeamId, awayTeamId, rules, umpireId } = req.body;
  if (!venue || !matchDate || !homeTeamId || !awayTeamId) { return res.status(400).json({ message: 'Please provide all required match details' }); }
  if (homeTeamId === awayTeamId) { return res.status(400).json({ message: 'Home and away teams cannot be the same.' }); }
  try {
    const isCaptain = await prisma.teamMembership.findFirst({ where: { userId: req.user.id, teamId: homeTeamId, role: 'CAPTAIN' } });
    if(!isCaptain) { return res.status(403).json({ message: 'Only the home team captain can create a match.' }); }
    const match = await prisma.match.create({ data: { venue, matchDate: new Date(matchDate), homeTeamId, awayTeamId, rules: rules || {}, umpireId: umpireId } });
    res.status(201).json(match);
  } catch (error) { console.error('Create Match Error:', error); res.status(500).json({ message: 'Server error while creating match' }); }
};
const getAllMatches = async (req, res) => {
    try {
        const matches = await prisma.match.findMany({ include: { homeTeam: { select: { id: true, name: true }}, awayTeam: { select: { id: true, name: true }}, }, orderBy: { matchDate: 'desc' } });
        res.json(matches);
    } catch (error) { console.error('Get All Matches Error:', error); res.status(500).json({ message: 'Server Error' }); }
}
const getMatchById = async (req, res) => {
  try {
    const match = await prisma.match.findUnique({ where: { id: req.params.id }, include: { homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, innings: { orderBy: { id: 'asc' }, include: { oversData: { orderBy: { overNumber: 'asc' }, include: { balls: { orderBy: { ballNumber: 'asc' } } }, }, }, }, }, });
    if (!match) { return res.status(404).json({ message: 'Match not found' }); }
    res.json(match);
  } catch (error) { console.error('Get Match By ID Error:', error); res.status(500).json({ message: 'Server Error' }); }
};

const updateScore = async (req, res) => {
    const { matchId } = req.params;
    const { inningsId, battingTeamId, bowlingTeamId, batsmanId, bowlerId, runsScored, isWicket, extraType, extraRuns } = req.body;

    try {
        // FIX: Increased the transaction timeout to 15 seconds (15000 ms)
        await prisma.$transaction(async (prisma) => {
            let innings;
            
            if (inningsId) {
                innings = await prisma.innings.findUnique({ where: { id: inningsId } });
            }
            if (!innings) {
                innings = await prisma.innings.findFirst({ where: { matchId: matchId, battingTeamId: battingTeamId } });
            }
            if (!innings) {
                innings = await prisma.innings.create({ data: { matchId, battingTeamId, bowlingTeamId } });
            }

            const lastOver = await prisma.over.findFirst({ where: { inningsId: innings.id }, orderBy: { overNumber: 'desc' } });
            
            const legalBallsInLastOver = lastOver ? await prisma.ball.count({ where: { overId: lastOver.id, extraType: { notIn: ['wd', 'nb'] } } }) : 0;
            
            let currentOverId = lastOver?.id;
            let currentOverNumber = lastOver?.overNumber || 1;

            if (!lastOver || legalBallsInLastOver >= 6) {
                if (lastOver) currentOverNumber++;
                const newOver = await prisma.over.create({ data: { inningsId: innings.id, overNumber: currentOverNumber, bowlerId } });
                currentOverId = newOver.id;
            } else if (lastOver && lastOver.bowlerId !== bowlerId) {
                await prisma.over.update({ where: { id: currentOverId }, data: { bowlerId: bowlerId } });
            }

            const ballsInThisOver = await prisma.ball.count({ where: { overId: currentOverId } });
            await prisma.ball.create({ data: { overId: currentOverId, ballNumber: ballsInThisOver + 1, batsmanId, runsScored, isWicket: !!isWicket, extraType, extraRuns: extraRuns || 0 } });

            const totalRunsThisBall = runsScored + (extraRuns || 0);
            const wicketsThisBall = isWicket ? 1 : 0;
            
            const totalLegalBalls = await prisma.ball.count({ where: { over: { inningsId: innings.id }, extraType: { notIn: ['wd', 'nb'] } } });
            const completedOvers = Math.floor(totalLegalBalls / 6);
            const ballsInCurrentOver = totalLegalBalls % 6;
            const oversFloat = parseFloat(`${completedOvers}.${ballsInCurrentOver}`);

            await prisma.innings.update({ where: { id: innings.id }, data: { score: { increment: totalRunsThisBall }, wickets: { increment: wicketsThisBall }, overs: oversFloat } });
            await prisma.match.update({ where: { id: matchId }, data: { status: 'ONGOING' } });
        }, {
            timeout: 15000, // 15 seconds
        });

        const updatedMatchState = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}},
                awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}},
                innings: { orderBy: { id: 'asc' }, include: { oversData: { orderBy: { overNumber: 'asc' }, include: { balls: { orderBy: { ballNumber: 'asc' } } } }, }, },
            },
        });
        
        const io = getIO();
        io.to(matchId).emit('scoreUpdated', updatedMatchState);
        res.status(200).json({ message: 'Score updated successfully', data: updatedMatchState });

    } catch (error) {
        console.error('Update Score Error:', error);
        res.status(500).json({ message: 'Server failed to update score. Please check the data and try again.' });
    }
};
module.exports = {
  createMatch,
  getAllMatches,
  getMatchById,
  updateScore,
};
