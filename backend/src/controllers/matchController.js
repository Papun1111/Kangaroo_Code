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
    const match = await prisma.match.create({ 
      data: { 
        venue, 
        matchDate: new Date(matchDate || Date.now()), 
        homeTeamId, 
        awayTeamId, 
        rules: rules || { overs: 20, wickets: 10 }, 
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
        await prisma.match.update({ where: { id: matchId }, data: { tossWinnerId, decision, status: 'ONGOING' } });
        const updatedMatchState = await prisma.match.findUnique({ where: { id: matchId }, include: { homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, innings: true } });
        getIO().to(matchId).emit('scoreUpdated', updatedMatchState);
        res.status(200).json(updatedMatchState);
    } catch (error) { console.error('Update Toss Error:', error); res.status(500).json({ message: 'Server failed to update toss.' }); }
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
    const ballsBowledByBowler = await prisma.ball.count({
        where: {
            over: { innings: { matchId: matchId }, bowlerId: bowlerId },
            extraType: { notIn: ['wd', 'nb'] }
        }
    });
    
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
        await prisma.$transaction(async (prisma) => {
            // 1. Find or Create Innings
            let innings;
            if (inningsId) { innings = await prisma.innings.findUnique({ where: { id: inningsId } }); }
            if (!innings) { innings = await prisma.innings.findFirst({ where: { matchId, battingTeamId } }); }
            if (!innings) { innings = await prisma.innings.create({ data: { matchId, battingTeamId, bowlingTeamId } }); }

            // 2. Determine Current State via Last Ball
            // We find the very last ball recorded to know exactly where we left off.
            const lastBall = await prisma.ball.findFirst({
                where: { over: { inningsId: innings.id } },
                orderBy: [ { over: { overNumber: 'desc' } }, { ballNumber: 'desc' } ],
                include: { over: true }
            });

            let lastOver = lastBall?.over;
            let currentOverNumber = lastOver ? lastOver.overNumber : 1;

            // 3. Calculate Legal Balls in this specific Over Number (across all segments)
            // This handles the case where Over 1 was split between Bowler A and Bowler B
            const ballsInCurrentOverNum = await prisma.ball.count({
                where: { 
                    over: { 
                        inningsId: innings.id, 
                        overNumber: currentOverNumber 
                    },
                    extraType: { notIn: ['wd', 'nb'] } 
                }
            });

            let currentOverId = lastOver?.id;

            // 4. Logic to Create or Split Over
            if (!lastOver || ballsInCurrentOverNum >= 6) {
                // Case A: Start a brand new over number
                if (lastOver) currentOverNumber++;
                const newOver = await prisma.over.create({ 
                    data: { inningsId: innings.id, overNumber: currentOverNumber, bowlerId } 
                });
                currentOverId = newOver.id;
            } else if (lastOver && lastOver.bowlerId !== bowlerId) {
                // Case B: Same over number, but DIFFERENT bowler.
                // Create a new "Over Segment" instead of overwriting the old one.
                // This preserves the previous bowler's stats.
                const newOver = await prisma.over.create({ 
                    data: { inningsId: innings.id, overNumber: currentOverNumber, bowlerId } 
                });
                currentOverId = newOver.id;
            } 
            // Case C: Same over number, same bowler -> continue using currentOverId

            // 5. Create Ball
            // We count balls in this specific segment to determine ball number
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

            // 6. Update Innings Totals
            const totalRunsThisBall = runsScored + (extraRuns || 0);
            const wicketsThisBall = isWicket ? 1 : 0;
            
            const totalLegalBallsInInnings = await prisma.ball.count({ where: { over: { inningsId: innings.id }, extraType: { notIn: ['wd', 'nb'] } } });
            const totalOvers = Math.floor(totalLegalBallsInInnings / 6);
            const totalBalls = totalLegalBallsInInnings % 6;
            const oversFloat = parseFloat(`${totalOvers}.${totalBalls}`);

            const updatedInnings = await prisma.innings.update({ 
                where: { id: innings.id }, 
                data: { score: { increment: totalRunsThisBall }, wickets: { increment: wicketsThisBall }, overs: oversFloat } 
            });
            
            // 7. Update Persistent Player Stats
            await updatePlayerStats(prisma, matchId, batsmanId, bowlerId, runsScored, !!isWicket, extraType, extraRuns);

            // 8. Check Match Status
            const match = await prisma.match.findUnique({ where: { id: matchId }, include: { innings: true } });
            const matchRules = match.rules || { overs: 20, wickets: 10 };
            const inningsCount = match.innings.length;

            if (inningsCount === 1 && (updatedInnings.wickets >= matchRules.wickets || updatedInnings.overs >= matchRules.overs)) {
                await prisma.match.update({ where: { id: matchId }, data: { status: 'INNINGS_BREAK' } });
            } else if (inningsCount === 2) {
                const firstInningsScore = match.innings[0].score;
                if (updatedInnings.score > firstInningsScore || updatedInnings.wickets >= matchRules.wickets || updatedInnings.overs >= matchRules.overs) {
                    await prisma.match.update({ where: { id: matchId }, data: { status: 'COMPLETED' } });
                }
            } else {
                 await prisma.match.update({ where: { id: matchId }, data: { status: 'ONGOING' } });
            }
        }, { timeout: 20000 });

        // 9. Broadcast Update
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
        res.status(500).json({ message: 'Server failed to update score.' });
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
        
        const updatedMatchState = await prisma.match.findUnique({ where: { id: matchId }, include: { homeTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, awayTeam: { include: { members: { include: { user: { select: {id:true, username:true}}}}}}, innings: true } });
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