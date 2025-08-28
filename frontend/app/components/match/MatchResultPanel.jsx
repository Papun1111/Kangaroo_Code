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
            className="card text-center max-w-lg mx-auto bg-emerald-500 text-white rounded-xl shadow-lg p-8 border border-emerald-600"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            <h2 className="text-3xl font-bold mb-2">Match Over</h2>
            {winner ? (
                <p className="text-xl">{winner.name} won {margin}</p>
            ) : (
                <p className="text-xl">{margin}</p>
            )}
        </motion.div>
    );
};

export default MatchResultPanel;
