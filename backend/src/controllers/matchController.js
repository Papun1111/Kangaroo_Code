const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../socket');

const createMatch = async (req, res) => {
  const { venue, matchDate, homeTeamId, awayTeamId, rules, umpireId } = req.body;
  if (!venue || !homeTeamId || !awayTeamId) { return res.status(400).json({ message: 'Please provide all required match details' }); }
  if (homeTeamId === awayTeamId) { return res.status(400).json({ message: 'Home and away teams cannot be the same.' }); }
  try {
    const isCaptain = await prisma.teamMembership.findFirst({ where: { userId: req.user.id, teamId: homeTeamId, role: 'CAPTAIN' } });
    if(!isCaptain) { return res.status(403).json({ message: 'Only the home team captain can create a match.' }); }
    
    // Ensure rules have defaults if not provided
    const matchRules = {
        overs: parseInt(rules?.overs) || 20,
        wickets: parseInt(rules?.wickets) || 10
    };

    const match = await prisma.match.create({ 
      data: { 
        venue, 
        matchDate: new Date(matchDate || Date.now()), 
        homeTeamId, 
        awayTeamId, 
        rules: matchRules, 
        umpireId: umpireId || null,
        status: 'TOSS'
      } 
    });
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
    const match = await prisma.match.findUnique({ where: { id: req.params.id }, include: { homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, innings: { orderBy: { id: 'asc' }, include: { oversData: { orderBy: { overNumber: 'asc' }, include: { balls: { orderBy: { ballNumber: 'asc' } } } }, }, }, }, });
    if (!match) { return res.status(404).json({ message: 'Match not found' }); }
    res.json(match);
  } catch (error) { console.error('Get Match By ID Error:', error); res.status(500).json({ message: 'Server Error' }); }
};

const updateToss = async (req, res) => {
    const { matchId } = req.params;
    const { tossWinnerId, decision } = req.body;
    try {
        const match = await prisma.match.findUnique({ where: { id: matchId } });
        if (!match) return res.status(404).json({ message: 'Match not found' });

        let battingTeamId, bowlingTeamId;
        const tossLoserId = tossWinnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;

        if (decision === 'bat') {
            battingTeamId = tossWinnerId;
            bowlingTeamId = tossLoserId;
        } else {
            battingTeamId = tossLoserId;
            bowlingTeamId = tossWinnerId;
        }

        await prisma.$transaction([
            prisma.match.update({
                where: { id: matchId },
                data: { tossWinnerId, decision, status: 'ONGOING' }
            }),
            prisma.innings.create({
                data: { matchId, battingTeamId, bowlingTeamId }
            })
        ]);
        
        const updatedMatchState = await prisma.match.findUnique({ 
            where: { id: matchId }, 
            include: { 
                homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, 
                awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, 
                innings: true 
            } 
        });

        getIO().to(matchId).emit('scoreUpdated', updatedMatchState);
        res.status(200).json(updatedMatchState);

    } catch (error) {
        console.error('Update Toss Error:', error);
        res.status(500).json({ message: 'Server failed to update toss.' });
    }
};

// Helper to update Player Stats (Persistent Records)
const updatePlayerStats = async (prisma, matchId, batsmanId, bowlerId, runsScored, isWicket, extraType, extraRuns) => {
    // 1. Update Batsman
    let batsmanProfile = await prisma.playerProfile.findUnique({ where: { userId: batsmanId } });
    if (!batsmanProfile) batsmanProfile = await prisma.playerProfile.create({ data: { userId: batsmanId } });

    let batsmanStat = await prisma.playerStat.findFirst({ where: { matchId, profileId: batsmanProfile.id } });
    if (!batsmanStat) batsmanStat = await prisma.playerStat.create({ data: { matchId, profileId: batsmanProfile.id, runs: 0, ballsFaced: 0, wickets: 0, oversBowled: 0, runsConceded: 0 } });

    const isLegalDeliveryForBatsman = extraType !== 'wd'; 
    await prisma.playerStat.update({
        where: { id: batsmanStat.id },
        data: {
            runs: { increment: runsScored },
            ballsFaced: { increment: isLegalDeliveryForBatsman ? 1 : 0 }
        }
    });

    // 2. Update Bowler
    let bowlerProfile = await prisma.playerProfile.findUnique({ where: { userId: bowlerId } });
    if (!bowlerProfile) bowlerProfile = await prisma.playerProfile.create({ data: { userId: bowlerId } });

    let bowlerStat = await prisma.playerStat.findFirst({ where: { matchId, profileId: bowlerProfile.id } });
    if (!bowlerStat) bowlerStat = await prisma.playerStat.create({ data: { matchId, profileId: bowlerProfile.id, runs: 0, ballsFaced: 0, wickets: 0, oversBowled: 0, runsConceded: 0 } });

    const runsConceded = runsScored + (['wd', 'nb'].includes(extraType) ? (extraRuns || 1) : 0); 
    const wicketTaken = isWicket && (['run_out', 'hit_wicket', 'retired_hurt'].indexOf(extraType) === -1) ? 1 : 0; 
    
    // Calculate this bowler's total balls in this match to derive overs
    const ballsByBowlerRaw = await prisma.ball.findMany({
        where: {
            over: { innings: { matchId: matchId }, bowlerId: bowlerId }
        },
        select: { extraType: true }
    });
    const ballsBowledByBowler = ballsByBowlerRaw.filter(b => !['wd', 'nb'].includes(b.extraType)).length;
    
    const completedOvers = Math.floor(ballsBowledByBowler / 6);
    const ballsInOver = ballsBowledByBowler % 6;
    const oversFloat = parseFloat(`${completedOvers}.${ballsInOver}`);

    await prisma.playerStat.update({
        where: { id: bowlerStat.id },
        data: {
            runsConceded: { increment: runsConceded },
            wickets: { increment: wicketTaken },
            oversBowled: oversFloat
        }
    });
};

const updateScore = async (req, res) => {
    const { matchId } = req.params;
    const { inningsId, battingTeamId, bowlingTeamId, batsmanId, bowlerId, runsScored, isWicket, extraType, extraRuns } = req.body;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Get Match Info & Rules
            const matchData = await prisma.match.findUnique({ where: { id: matchId }, include: { innings: true } });
            const rules = matchData.rules || {};
            const MAX_OVERS = parseInt(rules.overs) || 20;
            const MAX_WICKETS = parseInt(rules.wickets) || 10;
            const MAX_LEGAL_BALLS = MAX_OVERS * 6;

            let innings;
            let wasNewInningsCreated = false;

            if (inningsId) { innings = await prisma.innings.findUnique({ where: { id: inningsId } }); }
            if (!innings) { innings = await prisma.innings.findFirst({ where: { matchId, battingTeamId } }); }
            if (!innings) { 
                innings = await prisma.innings.create({ data: { matchId, battingTeamId, bowlingTeamId } });
                wasNewInningsCreated = true;
            }

            // Accurate Innings Count Logic
            const inningsCount = matchData.innings.length + (wasNewInningsCreated ? 1 : 0);

            // 2. PRE-CHECK: Is Innings limit ALREADY reached?
            const allBallsInInnings = await prisma.ball.findMany({
                where: { over: { inningsId: innings.id } },
                select: { extraType: true }
            });
            const currentLegalBalls = allBallsInInnings.filter(b => !['wd', 'nb'].includes(b.extraType)).length;

            if (currentLegalBalls >= MAX_LEGAL_BALLS || innings.wickets >= MAX_WICKETS) {
                const nextStatus = inningsCount === 1 ? 'INNINGS_BREAK' : 'COMPLETED';
                await prisma.match.update({ where: { id: matchId }, data: { status: nextStatus } });
                return { status: 'LIMIT_REACHED' }; 
            }

            // 3. Proceed to add ball
            const lastOver = await prisma.over.findFirst({ 
                where: { inningsId: innings.id }, 
                orderBy: { createdAt: 'desc' } 
            });
            
            let currentOverNumber = lastOver ? lastOver.overNumber : 1;
            
            const ballsInCurrentOverRaw = await prisma.ball.findMany({
                where: { over: { inningsId: innings.id, overNumber: currentOverNumber } },
                select: { extraType: true }
            });
            const ballsInCurrentOverNum = ballsInCurrentOverRaw.filter(b => !['wd', 'nb'].includes(b.extraType)).length;

            let currentOverId = lastOver?.id;

            if (!lastOver || ballsInCurrentOverNum >= 6) {
                // Start New Over Number
                if (lastOver) currentOverNumber++;
                const newOver = await prisma.over.create({ data: { inningsId: innings.id, overNumber: currentOverNumber, bowlerId } });
                currentOverId = newOver.id;
            } else if (lastOver && lastOver.bowlerId !== bowlerId) {
                // Split Over (New Segment, same number)
                const newOver = await prisma.over.create({ data: { inningsId: innings.id, overNumber: currentOverNumber, bowlerId } });
                currentOverId = newOver.id;
            }

            const ballsInThisSegment = await prisma.ball.count({ where: { overId: currentOverId } });
            await prisma.ball.create({ 
                data: { 
                    overId: currentOverId, 
                    ballNumber: ballsInThisSegment + 1, 
                    batsmanId, 
                    runsScored, 
                    isWicket: !!isWicket, 
                    extraType, 
                    extraRuns: extraRuns || 0 
                } 
            });

            // 5. Update Innings Score
            const totalRunsThisBall = runsScored + (extraRuns || 0);
            const wicketsThisBall = isWicket ? 1 : 0;
            
            const isLegal = !['wd', 'nb'].includes(extraType);
            const newTotalLegalBalls = currentLegalBalls + (isLegal ? 1 : 0);
            
            const completedOvers = Math.floor(newTotalLegalBalls / 6);
            const ballsInCurrentOver = newTotalLegalBalls % 6;
            const oversFloat = parseFloat(`${completedOvers}.${ballsInCurrentOver}`);

            const updatedInnings = await prisma.innings.update({ 
                where: { id: innings.id }, 
                data: { score: { increment: totalRunsThisBall }, wickets: { increment: wicketsThisBall }, overs: oversFloat } 
            });
            
            await updatePlayerStats(prisma, matchId, batsmanId, bowlerId, runsScored, !!isWicket, extraType, extraRuns);

            // 6. POST-CHECK: Did THIS ball finish the innings?
            const isAllOut = (updatedInnings.wickets >= MAX_WICKETS);
            const isOversDone = (newTotalLegalBalls >= MAX_LEGAL_BALLS);

            if (isAllOut || isOversDone) {
                if (inningsCount === 1) {
                    await prisma.match.update({ where: { id: matchId }, data: { status: 'INNINGS_BREAK' } });
                } else {
                    await prisma.match.update({ where: { id: matchId }, data: { status: 'COMPLETED' } });
                }
            } else if (inningsCount === 2) {
                const firstInningsScore = matchData.innings[0].score;
                if (updatedInnings.score > firstInningsScore) {
                    await prisma.match.update({ where: { id: matchId }, data: { status: 'COMPLETED' } });
                } else {
                    await prisma.match.update({ where: { id: matchId }, data: { status: 'ONGOING' } });
                }
            } else {
                 await prisma.match.update({ where: { id: matchId }, data: { status: 'ONGOING' } });
            }

            return { status: 'SUCCESS' };

        }, { timeout: 20000 });

        // Check transaction result
        if (result.status === 'LIMIT_REACHED') {
            const updatedMatchState = await prisma.match.findUnique({ where: { id: matchId }, include: { homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, innings: { orderBy: { id: 'asc' }, include: { oversData: { orderBy: { overNumber: 'asc' }, include: { balls: { orderBy: { ballNumber: 'asc' } } } }, }, }, }, });
            getIO().to(matchId).emit('scoreUpdated', updatedMatchState);
            return res.status(200).json({ message: 'Innings limit reached. Status updated.', data: updatedMatchState });
        }

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
        res.status(500).json({ message: error.message || 'Server failed to update score.' });
    }
};

const startNextInnings = async (req, res) => {
    const { matchId } = req.params;
    try {
        const match = await prisma.match.findUnique({ where: { id: matchId }, include: { innings: true } });
        if (!match || match.innings.length !== 1) { return res.status(400).json({ message: 'Cannot start second innings at this time.' }); }
        const firstInnings = match.innings[0];
        await prisma.innings.create({ data: { matchId, battingTeamId: firstInnings.bowlingTeamId, bowlingTeamId: firstInnings.battingTeamId } });
        await prisma.match.update({ where: { id: matchId }, data: { status: 'ONGOING' } });
        
        // FIX: Include the full nested structure for innings -> overs -> balls
        // This ensures the scorecard on the frontend receives the complete data for the first innings.
        const updatedMatchState = await prisma.match.findUnique({ 
            where: { id: matchId }, 
            include: { 
                homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, 
                awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, 
                innings: { 
                    orderBy: { id: 'asc' }, 
                    include: { 
                        oversData: { 
                            orderBy: { overNumber: 'asc' }, 
                            include: { balls: { orderBy: { ballNumber: 'asc' } } } 
                        } 
                    } 
                }, 
            } 
        });
        getIO().to(matchId).emit('scoreUpdated', updatedMatchState);
        res.status(200).json(updatedMatchState);
    } catch (error) { console.error('Start Next Innings Error:', error); res.status(500).json({ message: 'Server failed to start next innings.' }); }
};

module.exports = {
  createMatch,
  getAllMatches,
  getMatchById,
  updateToss,
  updateScore,
  startNextInnings,
};