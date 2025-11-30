"use client";

import { motion } from 'framer-motion';

const LiveScorecard = ({ match }) => {
    const getPlayerUsername = (playerId) => {
        const allMembers = [...match.homeTeam.members, ...match.awayTeam.members];
        const member = allMembers.find(m => m.user.id === playerId);
        return member ? member.user.username : 'Unknown Player';
    };

    const calculateTotalOvers = (innings) => {
        if (!innings || !innings.oversData) return "0.0";
        let legalBalls = 0;
        
        innings.oversData.forEach(over => {
            over.balls.forEach(ball => {
                if (ball.extraType !== 'wd' && ball.extraType !== 'nb') {
                    legalBalls++;
                }
            });
        });

        const overs = Math.floor(legalBalls / 6);
        const balls = legalBalls % 6;
        return `${overs}.${balls}`;
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

    // Replaces html2canvas/jspdf with native browser print
    const handlePrint = () => {
        window.print();
    };

    const renderInnings = (innings, inningsNumber) => {
        if (!innings) {
            return (
                <motion.div 
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-xl font-bold text-slate-400 uppercase tracking-wide mb-2">Innings {inningsNumber}</h2>
                    <p className="text-slate-500 text-lg">Yet to bat</p>
                </motion.div>
            );
        }
        
        const battingTeamName = match.homeTeam.id === innings.battingTeamId ? match.homeTeam.name : match.awayTeam.name;
        const { batting, bowling } = calculateInningsStats(innings);
        const currentOvers = calculateTotalOvers(innings);

        return (
            <motion.div 
                // Added print specific classes to remove shadows and handle page breaks
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 last:mb-0 print:shadow-none print:border-2 print:break-inside-avoid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: inningsNumber * 0.1 }}
            >
                {/* Header Section */}
                <div className="bg-slate-50/50 p-6 sm:p-8 border-b border-slate-100 print:bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Innings {inningsNumber}</span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{battingTeamName}</h2>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-emerald-600 print:text-black">{innings.score}</span>
                                <span className="text-3xl font-bold text-slate-400">/{innings.wickets}</span>
                            </div>
                            <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm mt-2 print:border-gray-300">
                                Overs: <span className="text-slate-900 font-bold">{currentOvers}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Batting Table */}
                <div className="p-6 sm:p-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1 h-4 bg-emerald-500 rounded-full mr-2 print:bg-black"></span>
                        Batting Scorecard
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-100 print:border-gray-300">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wide print:bg-gray-100">
                                <tr>
                                    <th className="p-4">Batsman</th>
                                    <th className="p-4 text-right">Runs</th>
                                    <th className="p-4 text-right">Balls</th>
                                    <th className="p-4 text-right">SR</th>
                                </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 text-sm text-slate-700 print:divide-gray-200">
                                {batting.map(b => (
                                    <tr key={b.playerId} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">
                                            {getPlayerUsername(b.playerId)} 
                                            {!b.isOut && <span className="ml-2 text-emerald-500 text-xs align-top print:text-black">●</span>}
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-slate-900">{b.runs}</td>
                                        <td className="p-4 text-right font-mono text-slate-500">{b.balls}</td>
                                        <td className="p-4 text-right font-mono text-slate-500">
                                            {b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}
                                        </td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                </div>

                {/* Bowling Table */}
                <div className="px-6 sm:px-8 pb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1 h-4 bg-blue-500 rounded-full mr-2 print:bg-black"></span>
                        Bowling Figures
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-100 print:border-gray-300">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold tracking-wide print:bg-gray-100">
                                <tr>
                                    <th className="p-4">Bowler</th>
                                    <th className="p-4 text-right">Overs</th>
                                    <th className="p-4 text-right">Runs</th>
                                    <th className="p-4 text-right">Wkts</th>
                                    <th className="p-4 text-right">Econ</th>
                                </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 text-sm text-slate-700 print:divide-gray-200">
                                {bowling.map(b => {
                                    const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
                                    const economy = b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(2) : '0.00';
                                    return (
                                        <tr key={b.playerId} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 font-medium text-slate-900">{getPlayerUsername(b.playerId)}</td>
                                            <td className="p-4 text-right font-mono text-slate-600">{overs}</td>
                                            <td className="p-4 text-right font-mono text-slate-600">{b.runs}</td>
                                            <td className="p-4 text-right font-mono font-bold text-emerald-600 print:text-black">{b.wickets}</td>
                                            <td className="p-4 text-right font-mono text-slate-500">{economy}</td>
                                        </tr>
                                    );
                                })}
                           </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Global styles to control printing layout */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #scorecard-container, #scorecard-container * {
                        visibility: visible;
                    }
                    #scorecard-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Ensure colors print correctly */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="flex justify-end mb-4 no-print">
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-emerald-600 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Print / Save PDF
                </button>
            </div>
            
            {/* ID for capturing print area */}
            <div id="scorecard-container" className="bg-slate-100 p-4 rounded-xl print:bg-white print:p-0"> 
                {renderInnings(match.innings[0], 1)}
                {match.status !== 'UPCOMING' && renderInnings(match.innings[1], 2)}
            </div>
        </div>
    );
};

export default LiveScorecard;