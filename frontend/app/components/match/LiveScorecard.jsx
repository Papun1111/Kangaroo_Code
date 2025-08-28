"use client";

import { motion } from 'motion/react';

const LiveScorecard = ({ match }) => {
    const getPlayerUsername = (playerId) => {
        const allMembers = [...match.homeTeam.members, ...match.awayTeam.members];
        const member = allMembers.find(m => m.user.id === playerId);
        return member ? member.user.username : 'Unknown Player';
    };

    const calculateInningsStats = (innings) => {
        const battingStats = {};
        const bowlingStats = {};

        if (!innings || !innings.oversData) {
            return { batting: [], bowling: [] };
        }

        for (const over of innings.oversData) {
            if (!bowlingStats[over.bowlerId]) {
                bowlingStats[over.bowlerId] = { runs: 0, wickets: 0, balls: 0 };
            }

            for (const ball of over.balls) {
                if (!battingStats[ball.batsmanId]) {
                    battingStats[ball.batsmanId] = { runs: 0, balls: 0, isOut: false };
                }

                battingStats[ball.batsmanId].runs += ball.runsScored;
                if (ball.extraType !== 'wd') {
                    battingStats[ball.batsmanId].balls++;
                }

                if (ball.extraType !== 'lb' && ball.extraType !== 'b') {
                    bowlingStats[over.bowlerId].runs += ball.runsScored + (ball.extraRuns || 0);
                }
                
                if (ball.extraType !== 'wd' && ball.extraType !== 'nb') {
                    bowlingStats[over.bowlerId].balls++;
                }

                if (ball.isWicket) {
                    battingStats[ball.batsmanId].isOut = true;
                    if (ball.wicketType !== 'run_out') { 
                        bowlingStats[over.bowlerId].wickets++;
                    }
                }
            }
        }

        const batting = Object.entries(battingStats).map(([playerId, stats]) => ({ playerId, ...stats }));
        const bowling = Object.entries(bowlingStats).map(([playerId, stats]) => ({ playerId, ...stats }));
        
        return { batting, bowling };
    };

    const renderInnings = (innings, inningsNumber) => {
        if (!innings) {
            return (
                <motion.div 
                    className="card bg-white rounded-xl shadow-lg p-6 border border-slate-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Innings {inningsNumber}</h2>
                    <p className="text-slate-500">Yet to bat.</p>
                </motion.div>
            );
        }
        
        const battingTeamName = match.homeTeam.id === innings.battingTeamId ? match.homeTeam.name : match.awayTeam.name;
        const { batting, bowling } = calculateInningsStats(innings);

        return (
            <motion.div 
                className="card bg-white rounded-xl shadow-lg p-6 border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: inningsNumber * 0.1 }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-3xl font-bold text-gray-900">{battingTeamName}</h2>
                    <p className="text-4xl font-bold text-emerald-500">
                        {innings.score}-{innings.wickets}
                        <span className="text-2xl text-slate-500 ml-2">({Math.floor(innings.overs)}.{(innings.overs * 10 % 10).toFixed(0)})</span>
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-xl mb-3 text-gray-800 border-b pb-2">Batting</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                               <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-gray-700">Batsman</th>
                                        <th className="p-3 font-semibold text-gray-700">Runs</th>
                                        <th className="p-3 font-semibold text-gray-700">Balls</th>
                                        <th className="p-3 font-semibold text-gray-700">SR</th>
                                    </tr>
                               </thead>
                               <tbody>
                                    {batting.map(b => (
                                        <tr key={b.playerId} className="hover:bg-emerald-50 transition-colors border-b last:border-b-0 border-slate-100">
                                            <td className="p-3 font-semibold text-gray-800">{getPlayerUsername(b.playerId)} {!b.isOut && <span className="text-emerald-500">*</span>}</td>
                                            <td className="p-3 text-gray-700">{b.runs}</td>
                                            <td className="p-3 text-gray-700">{b.balls}</td>
                                            <td className="p-3 text-gray-700">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(2) : '0.00'}</td>
                                        </tr>
                                    ))}
                               </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-xl mb-3 text-gray-800 border-b pb-2">Bowling</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                               <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-gray-700">Bowler</th>
                                        <th className="p-3 font-semibold text-gray-700">Overs</th>
                                        <th className="p-3 font-semibold text-gray-700">Runs</th>
                                        <th className="p-3 font-semibold text-gray-700">Wickets</th>
                                        <th className="p-3 font-semibold text-gray-700">Econ</th>
                                    </tr>
                               </thead>
                               <tbody>
                                    {bowling.map(b => {
                                        const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
                                        const economy = b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(2) : '0.00';
                                        return (
                                            <tr key={b.playerId} className="hover:bg-emerald-50 transition-colors border-b last:border-b-0 border-slate-100">
                                                <td className="p-3 font-semibold text-gray-800">{getPlayerUsername(b.playerId)}</td>
                                                <td className="p-3 text-gray-700">{overs}</td>
                                                <td className="p-3 text-gray-700">{b.runs}</td>
                                                <td className="p-3 text-gray-700">{b.wickets}</td>
                                                <td className="p-3 text-gray-700">{economy}</td>
                                            </tr>
                                        );
                                    })}
                               </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-8">
            {renderInnings(match.innings[0], 1)}
            {match.status !== 'UPCOMING' && renderInnings(match.innings[1], 2)}
        </div>
    );
};

export default LiveScorecard;
