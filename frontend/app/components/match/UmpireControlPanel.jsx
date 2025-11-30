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

    useEffect(() => {
        if (!match) return;

        // 1. SAFELY DETERMINE CURRENT INNINGS
        let currentInnings = null;
        if (match.innings && match.innings.length > 0) {
            const sortedInnings = [...match.innings].sort((a, b) => 
                (a.id > b.id) ? 1 : -1
            );
            currentInnings = sortedInnings[sortedInnings.length - 1];
        }

        // 2. DETERMINE TEAMS BASED ON CURRENT INNINGS
        if (currentInnings) {
            const batTeam = [match.homeTeam, match.awayTeam].find(t => t.id === currentInnings.battingTeamId);
            const bowlTeam = [match.homeTeam, match.awayTeam].find(t => t.id === currentInnings.bowlingTeamId);
            
            setBattingTeam(batTeam);
            setBowlingTeam(bowlTeam);

            if (currentInnings.id !== prevInningsIdRef.current) {
                setBatsmanId('');
                setBowlerId('');
                prevInningsIdRef.current = currentInnings.id;
            }

            const currentOvers = currentInnings.overs || 0;
            const isOverComplete = currentOvers % 1 === 0 && currentOvers > 0;
            
            if (isOverComplete && currentOvers !== prevOversRef.current) {
                setBowlerId(''); 
            }
            prevOversRef.current = currentOvers;

        } else {
            setBattingTeam(match.homeTeam);
            setBowlingTeam(match.awayTeam);
        }

    }, [match]);

    // Helper to identify players who are already out
    const getDismissedPlayerIds = () => {
        const dismissedIds = new Set();
        if (!match || !match.innings || match.innings.length === 0) return dismissedIds;

        // Get the current innings data
        const sortedInnings = [...match.innings].sort((a, b) => (a.id > b.id) ? 1 : -1);
        const currentInnings = sortedInnings[sortedInnings.length - 1];

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

    const dismissedPlayerIds = getDismissedPlayerIds();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!batsmanId || !bowlerId) {
            setError('Please select both a batsman and a bowler.');
            return;
        }
        setError('');
        setLoading(true);

        let currentInningsId = null;
        if (match.innings && match.innings.length > 0) {
             const sortedInnings = [...match.innings].sort((a, b) => (a.id > b.id) ? 1 : -1);
             currentInningsId = sortedInnings[sortedInnings.length - 1].id;
        }

        const scoreData = {
            inningsId: currentInningsId,
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
            className="card mt-8 border-t-4 border-emerald-500 bg-white rounded-xl shadow-lg p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 text-[#111111]">Score Update Panel</motion.h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[#111111] mb-2 font-semibold">
                            On Strike ({battingTeam.name})
                        </label>
                        <select value={batsmanId} onChange={(e) => setBatsmanId(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" required>
                            <option value="">Select Batsman</option>
                            {battingTeam.members
                                .filter(m => !dismissedPlayerIds.has(m.userId)) // Filter out dismissed players
                                .map(m => (
                                    <option key={m.userId} value={m.userId} className="text-[#111111]">
                                        {m.user.username}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div>
                        <label className="block text-[#111111] mb-2 font-semibold">
                            Bowler ({bowlingTeam.name})
                        </label>
                        <select value={bowlerId} onChange={(e) => setBowlerId(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" required>
                            <option value="">Select Bowler</option>
                            {bowlingTeam.members.map(m => <option key={m.userId} value={m.userId} className="text-[#111111]">{m.user.username}</option>)}
                        </select>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-[#111111] mb-2 font-semibold">Runs</label>
                        <input type="number" min="0" max="6" value={runsScored} onChange={(e) => setRunsScored(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div>
                        <label className="block text-[#111111] mb-2 font-semibold">Extras Type</label>
                        <select value={extraType} onChange={(e) => setExtraType(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500">
                            <option value="">None</option>
                            <option value="wd" className="text-[#111111]">Wide</option>
                            <option value="nb" className="text-[#111111]">No Ball</option>
                            <option value="b" className="text-[#111111]">Bye</option>
                            <option value="lb" className="text-[#111111]">Leg Bye</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-[#111111] mb-2 font-semibold">Extra Runs</label>
                        <input type="number" min="0" value={extraRuns} onChange={(e) => setExtraRuns(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div className="flex items-center justify-center pb-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" checked={isWicket} onChange={(e) => setIsWicket(e.target.checked)} className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                            <span className="font-semibold text-red-600">Wicket?</span>
                        </label>
                    </div>
                </motion.div>

                <motion.button 
                    variants={itemVariants}
                    type="submit" 
                    className="btn bg-emerald-500 text-white w-full !mt-6 py-3 text-lg font-bold transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-1" 
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? 'Submitting...' : 'Submit Ball'}
                </motion.button>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
        </motion.div>
    );
};

export default UmpireControlPanel;