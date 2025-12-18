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

    const handlePrint = () => {
        window.print();
    };

    const renderInnings = (innings, inningsNumber) => {
        if (!innings) {
            return (
                <motion.div 
                    className="bg-[#0a0a0a] rounded-2xl shadow-lg border border-white/10 p-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-wide mb-2">Innings {inningsNumber}</h2>
                    <p className="text-zinc-300 text-lg">Yet to bat</p>
                </motion.div>
            );
        }
        
        const battingTeamName = match.homeTeam.id === innings.battingTeamId ? match.homeTeam.name : match.awayTeam.name;
        const { batting, bowling } = calculateInningsStats(innings);
        const currentOvers = calculateTotalOvers(innings);

        return (
            <motion.div 
                className="bg-[#0a0a0a] rounded-2xl shadow-xl border border-white/10 overflow-hidden mb-8 last:mb-0 print:shadow-none print:border-2 print:break-inside-avoid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: inningsNumber * 0.1 }}
            >
                {/* Header Section */}
                <div className="bg-zinc-900/50 p-6 sm:p-8 border-b border-white/5 print:bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">Innings {inningsNumber}</span>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter print:text-black">{battingTeamName}</h2>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-emerald-400 print:text-black">{innings.score}</span>
                                <span className="text-3xl font-bold text-zinc-300">/{innings.wickets}</span>
                            </div>
                            <div className="text-sm font-medium text-zinc-300 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 mt-3 print:border-gray-300 print:text-black print:bg-white">
                                Overs: <span className="text-white font-bold print:text-black">{currentOvers}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Batting Table */}
                <div className="p-6 sm:p-8">
                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center print:text-black">
                        <span className="w-1.5 h-4 bg-emerald-500 rounded-full mr-3 print:bg-black"></span>
                        Batting Scorecard
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-white/5 print:border-gray-300">
                        <table className="w-full text-left">
                           <thead className="bg-zinc-900 text-xs uppercase text-zinc-400 font-semibold tracking-wide print:bg-gray-100 print:text-gray-700">
                                <tr>
                                    <th className="p-4">Batsman</th>
                                    <th className="p-4 text-right">Runs</th>
                                    <th className="p-4 text-right">Balls</th>
                                    <th className="p-4 text-right">SR</th>
                                </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 text-sm text-zinc-200 print:divide-gray-200 print:text-black">
                                {batting.map(b => (
                                    <tr key={b.playerId} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white print:text-black">
                                            {getPlayerUsername(b.playerId)} 
                                            {!b.isOut && <span className="ml-2 text-emerald-400 text-xs align-top print:text-black">●</span>}
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-emerald-400 print:text-black">{b.runs}</td>
                                        <td className="p-4 text-right font-mono text-zinc-300">{b.balls}</td>
                                        <td className="p-4 text-right font-mono text-zinc-300">
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
                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center print:text-black">
                        <span className="w-1.5 h-4 bg-blue-500 rounded-full mr-3 print:bg-black"></span>
                        Bowling Figures
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-white/5 print:border-gray-300">
                        <table className="w-full text-left">
                           <thead className="bg-zinc-900 text-xs uppercase text-zinc-400 font-semibold tracking-wide print:bg-gray-100 print:text-gray-700">
                                <tr>
                                    <th className="p-4">Bowler</th>
                                    <th className="p-4 text-right">Overs</th>
                                    <th className="p-4 text-right">Runs</th>
                                    <th className="p-4 text-right">Wkts</th>
                                    <th className="p-4 text-right">Econ</th>
                                </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 text-sm text-zinc-200 print:divide-gray-200 print:text-black">
                                {bowling.map(b => {
                                    const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
                                    const economy = b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(2) : '0.00';
                                    return (
                                        <tr key={b.playerId} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white print:text-black">{getPlayerUsername(b.playerId)}</td>
                                            <td className="p-4 text-right font-mono text-zinc-300">{overs}</td>
                                            <td className="p-4 text-right font-mono text-zinc-300">{b.runs}</td>
                                            <td className="p-4 text-right font-mono font-bold text-emerald-400 print:text-black">{b.wickets}</td>
                                            <td className="p-4 text-right font-mono text-zinc-300">{economy}</td>
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
                    /* Force background colors for print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Invert dark theme for print readability */
                    .bg-\[\#0a0a0a\] { background-color: white !important; color: black !important; border: 1px solid #ddd !important; }
                    .text-white { color: black !important; }
                    .text-emerald-500, .text-emerald-400 { color: black !important; font-weight: bold !important; }
                    .text-zinc-500, .text-zinc-400, .text-zinc-300, .text-zinc-200 { color: #333 !important; }
                    .bg-zinc-900 { background-color: #f3f4f6 !important; }
                    .border-white\/10, .border-white\/5 { border-color: #ddd !important; }
                }
            `}</style>

            <div className="flex justify-end mb-4 no-print">
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-zinc-900 text-zinc-300 px-4 py-2 rounded-lg font-bold text-sm shadow-lg border border-white/10 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all duration-300 group"
                >
                    <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Print / Save PDF
                </button>
            </div>
            
            {/* ID for capturing print area */}
            <div id="scorecard-container"> 
                {renderInnings(match.innings[0], 1)}
                {match.status !== 'UPCOMING' && renderInnings(match.innings[1], 2)}
            </div>
        </div>
    );
};

export default LiveScorecard;