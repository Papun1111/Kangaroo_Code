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
            className="card text-center max-w-lg mx-auto bg-[#0a0a0a] rounded-[2rem] shadow-2xl p-10 border border-white/10 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <svg className="w-40 h-40 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z"/></svg>
            </div>

            <div className="relative z-10">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">
                    Innings <span className="text-emerald-500">Break</span>
                </h2>
                
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm mb-8">
                    <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest mb-2">Target Set</p>
                    <p className="text-white text-lg">
                        <span className="font-bold text-emerald-400">{chasingTeam.name}</span> needs <span className="font-black text-4xl text-white mx-1">{target}</span> runs to win
                    </p>
                </div>

                <motion.button 
                    onClick={handleStartInnings}
                    className="btn bg-emerald-500 text-black w-full py-4 text-xl font-black uppercase tracking-wide shadow-lg hover:bg-emerald-400 transition-all rounded-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Start 2nd Innings
                </motion.button>
            </div>
        </motion.div>
    );
};

export default InningsBreakPanel;