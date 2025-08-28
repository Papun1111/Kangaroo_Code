"use client";

import axios from 'axios';
import { motion } from 'framer-motion';

const InningsBreakPanel = ({ match, onInningsStart }) => {
    const firstInnings = match.innings[0];
    const target = firstInnings.score + 1;
    const chasingTeam = match.homeTeam.id === firstInnings.bowlingTeamId ? match.homeTeam : match.awayTeam;

    const handleStartInnings = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}/start-innings`);
            onInningsStart(res.data);
        } catch (error) {
            console.error("Failed to start next innings", error);
        }
    };

    return (
        <motion.div 
            className="card text-center max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <h2 className="text-2xl font-bold text-black mb-2">Innings Break</h2>
            <p className="text-slate-600 mb-4">{chasingTeam.name} need <span className="font-bold text-emerald-500 text-xl">{target}</span> runs to win.</p>
            <motion.button 
                onClick={handleStartInnings}
                className="btn bg-emerald-500 text-white px-8 py-3 rounded-full font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Start 2nd Innings
            </motion.button>
        </motion.div>
    );
};

export default InningsBreakPanel;
