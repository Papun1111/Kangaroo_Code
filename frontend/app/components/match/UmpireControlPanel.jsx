"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const UmpireControlPanel = ({ match, onScoreUpdate }) => {
    const [batsmanId, setBatsmanId] = useState('');
    const [bowlerId, setBowlerId] = useState('');
    const [runsScored, setRunsScored] = useState('0');
    const [isWicket, setIsWicket] = useState(false);
    const [extraType, setExtraType] = useState('');
    const [extraRuns, setExtraRuns] = useState('0');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [battingTeam, setBattingTeam] = useState(null);
    const [bowlingTeam, setBowlingTeam] = useState(null);

    // Track previous innings ID to reset selections when innings changes
    const prevInningsIdRef = useRef(null);
    // Track previous overs to detect end of over
    const prevOversRef = useRef(0);

    // Helper to identify players who are already out
    const getDismissedPlayerIds = () => {
        const dismissedIds = new Set();
        if (!match || !match.innings || match.innings.length === 0) return dismissedIds;

        const currentInnings = getCurrentInnings(match);

        if (currentInnings && currentInnings.oversData) {
            currentInnings.oversData.forEach(over => {
                over.balls.forEach(ball => {
                    if (ball.isWicket) {
                        dismissedIds.add(ball.batsmanId);
                    }
                });
            });
        }
        return dismissedIds;
    };

    // Robust logic to find the current active innings object
    const getCurrentInnings = (matchData) => {
        if (!matchData.innings || matchData.innings.length === 0) return null;
        
        // 1. Determine who batted first based on toss
        const tossWinnerId = matchData.tossWinnerId;
        const decision = matchData.decision;
        const tossLoserId = matchData.homeTeamId === tossWinnerId ? matchData.awayTeamId : matchData.homeTeamId;
        
        const firstBattingTeamId = decision === 'bat' ? tossWinnerId : tossLoserId;

        // 2. Find the innings object for the first batting team
        const firstInnings = matchData.innings.find(i => i.battingTeamId === firstBattingTeamId);
        
        // 3. If there are 2 innings, return the one that is NOT the first innings
        if (matchData.innings.length === 2) {
            return matchData.innings.find(i => i.id !== firstInnings?.id);
        }
        
        // 4. Otherwise return the first innings
        return firstInnings || matchData.innings[0];
    };

    const dismissedPlayerIds = getDismissedPlayerIds();

    useEffect(() => {
        if (!match) return;

        const currentInnings = getCurrentInnings(match);

        // DETERMINE TEAMS BASED ON CURRENT INNINGS
        if (currentInnings) {
            const batTeam = [match.homeTeam, match.awayTeam].find(t => t.id === currentInnings.battingTeamId);
            const bowlTeam = [match.homeTeam, match.awayTeam].find(t => t.id === currentInnings.bowlingTeamId);
            
            setBattingTeam(batTeam);
            setBowlingTeam(bowlTeam);

            // Logic: Reset selections if we just started a NEW innings
            if (currentInnings.id !== prevInningsIdRef.current) {
                setBatsmanId('');
                setBowlerId('');
                prevInningsIdRef.current = currentInnings.id;
            }

            // Logic: Reset Bowler ONLY if an over just finished (whole number overs)
            const currentOvers = currentInnings.overs || 0;
            // Check if the over count changed AND it resulted in a complete over
            const isOverComplete = currentOvers % 1 === 0 && currentOvers > 0;
            
            if (isOverComplete && currentOvers !== prevOversRef.current) {
                setBowlerId(''); // Force umpire to pick new bowler for new over
            }
            prevOversRef.current = currentOvers;

        } else {
            // Default setup for pre-match or toss phase
            setBattingTeam(match.homeTeam);
            setBowlingTeam(match.awayTeam);
        }

    }, [match]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!batsmanId || !bowlerId) {
            setError('Please select both a batsman and a bowler.');
            return;
        }
        setError('');
        setLoading(true);

        const currentInnings = getCurrentInnings(match);

        const scoreData = {
            inningsId: currentInnings?.id,
            battingTeamId: battingTeam.id,
            bowlingTeamId: bowlingTeam.id,
            batsmanId,
            bowlerId,
            runsScored: parseInt(runsScored, 10),
            isWicket,
            extraType: extraType || null,
            extraRuns: parseInt(extraRuns, 10),
        };

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}/score`, scoreData);
            onScoreUpdate(res.data.data);
            
            // If the current batsman got out, clear the selection
            if (isWicket) {
                setBatsmanId('');
            }

            // Reset ball-specific fields
            setIsWicket(false);
            setRunsScored('0');
            setExtraType('');
            setExtraRuns('0');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update score.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!battingTeam || !bowlingTeam) {
        return null;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="card mt-12 bg-[#0a0a0a] rounded-[2rem] shadow-2xl p-8 md:p-10 border border-white/10 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
                <motion.h2 variants={itemVariants} className="text-3xl font-black mb-8 text-white uppercase tracking-tighter text-center">
                    Score <span className="text-emerald-500">Control</span> Panel
                </motion.h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                                On Strike ({battingTeam.name})
                            </label>
                            <div className="relative">
                                <select value={batsmanId} onChange={(e) => setBatsmanId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300" required>
                                    <option value="" className="bg-zinc-800 text-white">Select Batsman</option>
                                    {battingTeam.members
                                        .filter(m => !dismissedPlayerIds.has(m.userId) || m.userId === batsmanId) // Show available + currently selected
                                        .map(m => (
                                            <option key={m.userId} value={m.userId} className="bg-zinc-800 text-white">
                                                {m.user.username}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                                Bowler ({bowlingTeam.name})
                            </label>
                            <div className="relative">
                                <select value={bowlerId} onChange={(e) => setBowlerId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300" required>
                                    <option value="" className="bg-zinc-800 text-white">Select Bowler</option>
                                    {bowlingTeam.members.map(m => <option key={m.userId} value={m.userId} className="bg-zinc-800 text-white">{m.user.username}</option>)}
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end bg-white/5 p-6 rounded-2xl border border-white/5">
                        <div>
                            <label className="block text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">Runs</label>
                            <input type="number" min="0" max="6" value={runsScored} onChange={(e) => setRunsScored(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300" />
                        </div>
                        <div>
                            <label className="block text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">Extras Type</label>
                            <select value={extraType} onChange={(e) => setExtraType(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300">
                                <option value="" className="bg-zinc-800 text-white">None</option>
                                <option value="wd" className="bg-zinc-800 text-white">Wide</option>
                                <option value="nb" className="bg-zinc-800 text-white">No Ball</option>
                                <option value="b" className="bg-zinc-800 text-white">Bye</option>
                                <option value="lb" className="bg-zinc-800 text-white">Leg Bye</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1">Extra Runs</label>
                            <input type="number" min="0" value={extraRuns} onChange={(e) => setExtraRuns(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300" />
                        </div>
                        <div className="flex items-center justify-center pb-2 h-full">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isWicket ? 'bg-red-500 border-red-500' : 'border-zinc-500 group-hover:border-red-400'}`}>
                                    {isWicket && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                </div>
                                <input type="checkbox" checked={isWicket} onChange={(e) => setIsWicket(e.target.checked)} className="hidden" />
                                <span className={`font-bold text-sm uppercase tracking-wider transition-colors ${isWicket ? 'text-red-500' : 'text-zinc-400 group-hover:text-red-400'}`}>Wicket?</span>
                            </label>
                        </div>
                    </motion.div>

                    <motion.button 
                        variants={itemVariants}
                        type="submit" 
                        className="btn bg-emerald-500 text-black font-black w-full py-4 rounded-xl text-lg uppercase tracking-wide transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] mt-6" 
                        disabled={loading}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'PROCESSING...' : 'SUBMIT DELIVERY'}
                    </motion.button>
                    
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-center mt-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-sm font-mono"
                        >
                            {error}
                        </motion.div>
                    )}
                </form>
            </div>
        </motion.div>
    );
};

export default UmpireControlPanel;