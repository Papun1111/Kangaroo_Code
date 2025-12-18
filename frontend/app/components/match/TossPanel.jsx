"use client";

import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const TossPanel = ({ match, onTossUpdate }) => {
    const [tossWinnerId, setTossWinnerId] = useState('');
    const [decision, setDecision] = useState('bat');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Animation states
    const [isTossing, setIsTossing] = useState(false);
    // Combined animation state object
    const [coinAnim, setCoinAnim] = useState({ rotateY: 0, y: 0, scale: 1 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tossWinnerId) {
            setError('Please select the team that won the toss.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // 1. Submit the toss result
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}/toss`,
                { tossWinnerId, decision }
            );

            // 2. Fetch the fresh match data to ensure we have the newly created innings
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}`);
            
            // 3. Update the parent state
            onTossUpdate(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit toss result.');
        } finally {
            setLoading(false);
        }
    };

    const handleToss = () => {
        if (isTossing || tossWinnerId) return; // Prevent multiple tosses
        
        setIsTossing(true);
        setError('');

        // 50/50 chance
        const isHomeWinner = Math.random() < 0.5;
        const winnerId = isHomeWinner ? match.homeTeam.id : match.awayTeam.id;
        
        const spins = 10; // More spins for a faster, more realistic look
        const duration = 2.5;
        const baseRotation = spins * 360; 
        const targetRotation = baseRotation + (isHomeWinner ? 0 : 180);

        setCoinAnim({
            rotateY: targetRotation,
            y: [0, -200, 0],     // Move up then down
            scale: [1, 1.5, 1],  // Scale up then down to simulate depth
        });

        setTimeout(() => {
            setTossWinnerId(winnerId);
            setIsTossing(false);
        }, duration * 1000);
    };

    // Helper to get name of selected winner for the UI
    const getWinnerName = () => {
        if (tossWinnerId === match.homeTeam.id) return match.homeTeam.name;
        if (tossWinnerId === match.awayTeam.id) return match.awayTeam.name;
        return "";
    };

    return (
        <motion.div 
            className="card max-w-lg mx-auto bg-[#0a0a0a] rounded-[2rem] shadow-2xl p-10 border border-white/10 relative overflow-visible mt-28 mb-12" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none overflow-hidden rounded-[2rem]">
                 <svg className="w-40 h-40 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z"/></svg>
            </div>

            <h2 className="text-3xl font-black text-center text-white mb-8 uppercase tracking-tighter relative z-10">
                Match <span className="text-emerald-500">Toss</span>
            </h2>
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-6 rounded-xl text-center">
                    <p>{error}</p>
                </div>
            )}

            {/* Coin Container - Added extra margin to prevent overlapping */}
            <div className="flex flex-col items-center justify-center my-16 perspective-1000 relative z-20 h-64">
                <div className="relative w-48 h-48" style={{ perspective: '1000px' }}>
                    <motion.div
                        className="w-full h-full relative"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={coinAnim}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    >
                        {/* Front Side (Home Team) */}
                        <div 
                            className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-900 border-[6px] border-emerald-300 flex items-center justify-center backface-hidden shadow-[0_0_60px_rgba(16,185,129,0.6)]"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div className="text-center p-4">
                                <span className="block text-5xl font-black text-white mb-2 drop-shadow-lg">{match.homeTeam.name.charAt(0)}</span>
                                <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">{match.homeTeam.name}</span>
                            </div>
                        </div>

                        {/* Back Side (Away Team) */}
                        <div 
                            className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-slate-600 to-slate-900 border-[6px] border-slate-400 flex items-center justify-center backface-hidden shadow-[0_0_60px_rgba(148,163,184,0.6)]"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                             <div className="text-center p-4">
                                <span className="block text-5xl font-black text-white mb-2 drop-shadow-lg">{match.awayTeam.name.charAt(0)}</span>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{match.awayTeam.name}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Shadow Effect */}
                <motion.div 
                    className="absolute -bottom-4 w-32 h-4 bg-black/50 blur-xl rounded-[100%]"
                    animate={{ 
                        scale: isTossing ? [1, 0.5, 1] : 1,
                        opacity: isTossing ? [0.6, 0.2, 0.6] : 0.6
                    }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                />
            </div>

            {/* If toss hasn't happened, show Toss Button */}
            {!tossWinnerId && (
                <motion.button
                    onClick={handleToss}
                    disabled={isTossing}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(5,150,105,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isTossing ? 'Flipping Coin...' : 'FLIP COIN'}
                </motion.button>
            )}

            {/* If toss happened, show Winner and Decision Form */}
            <AnimatePresence>
                {tossWinnerId && (
                    <motion.form 
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-6 overflow-hidden relative z-30 pt-6"
                    >
                        <div className="text-center space-y-2">
                            <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">Toss Winner</p>
                            <p className="text-3xl font-black text-white tracking-tight">{getWinnerName()}</p>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <label className="block text-emerald-400 mb-4 font-mono text-sm uppercase tracking-widest text-center">
                                Election Decision
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setDecision('bat')}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                        decision === 'bat' 
                                        ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400'
                                    }`}
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    <span className="font-bold uppercase text-sm tracking-wide">Bat</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDecision('field')}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                        decision === 'field' 
                                        ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400'
                                    }`}
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    <span className="font-bold uppercase text-sm tracking-wide">Field</span>
                                </button>
                            </div>
                        </div>

                        <motion.button 
                            type="submit" 
                            className="btn bg-white text-black w-full py-4 text-xl font-black uppercase tracking-wide shadow-lg hover:bg-emerald-400 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'STARTING...' : 'START MATCH'}
                        </motion.button>
                    </motion.form>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TossPanel;