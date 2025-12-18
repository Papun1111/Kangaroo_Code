"use client";

import { motion } from 'framer-motion';

const MatchResultPanel = ({ match }) => {
    if (!match || match.innings.length < 2) {
        return null; // Don't render if the match isn't complete
    }

    const firstInnings = match.innings[0];
    const secondInnings = match.innings[1];

    const teamOne = match.homeTeam.id === firstInnings.battingTeamId ? match.homeTeam : match.awayTeam;
    const teamTwo = match.homeTeam.id === secondInnings.battingTeamId ? match.homeTeam : match.awayTeam;

    let winner, margin;

    if (secondInnings.score > firstInnings.score) {
        winner = teamTwo;
        const wicketsRemaining = (match.rules?.wickets || 10) - secondInnings.wickets;
        margin = `by ${wicketsRemaining} wicket(s)`;
    } else if (firstInnings.score > secondInnings.score) {
        winner = teamOne;
        const runsMargin = firstInnings.score - secondInnings.score;
        margin = `by ${runsMargin} run(s)`;
    } else {
        winner = null; // It's a tie
        margin = "Match Tied";
    }

    return (
        <motion.div 
            className="card text-center max-w-lg mx-auto bg-[#0a0a0a] rounded-[2rem] shadow-2xl p-10 border border-white/10 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <svg className="w-40 h-40 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z"/></svg>
            </div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                    Match <span className="text-emerald-500">Concluded</span>
                </h2>

                <div className="h-px w-full bg-white/10 my-6" />

                {winner ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-1">Victor</p>
                            <p className="text-2xl md:text-3xl font-bold text-white">{winner.name}</p>
                        </div>
                        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                            <p className="text-emerald-400 font-medium">Won {margin}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-2xl font-bold text-white">{margin}</p>
                )}
            </div>
        </motion.div>
    );
};

export default MatchResultPanel;