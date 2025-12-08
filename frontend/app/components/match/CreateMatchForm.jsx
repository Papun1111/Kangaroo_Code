"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const CreateMatchForm = () => {
    const [venue, setVenue] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [umpireId, setUmpireId] = useState('');
    const [overs, setOvers] = useState('20'); // Default 20 overs
    const [wickets, setWickets] = useState('10'); // Default 10 wickets
    const [userTeams, setUserTeams] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) return;
            try {
                const [teamsRes, usersRes, profileRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/teams`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${user.id}`)
                ]);
                
                setAllTeams(teamsRes.data);
                setAllUsers(usersRes.data);

                const captainOfTeams = profileRes.data.teamMemberships
                    .filter(m => m.role === 'CAPTAIN')
                    .map(m => m.team);
                setUserTeams(captainOfTeams);
                
                if (captainOfTeams.length === 1) {
                    setHomeTeamId(captainOfTeams[0].id);
                }

            } catch (err) {
                setError('Could not load initial data for match creation.');
            }
        };
        fetchInitialData();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (homeTeamId === awayTeamId) {
            setError('Home and Away teams cannot be the same.');
            return;
        }
        setLoading(true);
        try {
            const matchData = {
                venue,
                matchDate,
                homeTeamId,
                awayTeamId,
                umpireId: umpireId || null,
                rules: {
                    overs: parseInt(overs, 10),
                    wickets: parseInt(wickets, 10)
                }
            };

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/matches`,
                matchData
            );
            router.push(`/matches/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create match.');
        } finally {
            setLoading(false);
        }
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    // Helper Styles
    const labelStyle = "block text-emerald-500 text-xs font-mono uppercase tracking-widest mb-2 ml-1";
    const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300";
    const optionStyle = "bg-[#1a1a1a] text-gray-200 py-2";

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Added pt-28 to push content below the fixed Navbar */}
            <motion.div 
                className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-28 pb-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="text-center mb-10">
                    <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
                        Initialize Match Protocol
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-gray-400 font-mono text-sm uppercase tracking-widest">
                        Configure Venue, Opponents, and Ruleset
                    </motion.p>
                </div>

                <motion.div 
                    className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden"
                    variants={itemVariants}
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                         <svg className="w-40 h-40 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.4z"/></svg>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-sm flex items-center gap-3"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        
                        {/* Teams Selection */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <motion.div variants={itemVariants}>
                                <label htmlFor="homeTeam" className={labelStyle}>Hosting Squad (Home)</label>
                                <div className="relative">
                                    <select id="homeTeam" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className={inputStyle} required>
                                        <option value="" className={optionStyle}>Select Authorization</option>
                                        {userTeams.map(team => <option key={team.id} value={team.id} className={optionStyle}>{team.name}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="awayTeam" className={labelStyle}>Opposing Force (Away)</label>
                                <div className="relative">
                                    <select id="awayTeam" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className={inputStyle} required>
                                        <option value="" className={optionStyle}>Select Target</option>
                                        {allTeams.filter(t => t.id !== homeTeamId).map(team => <option key={team.id} value={team.id} className={optionStyle}>{team.name}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="h-px w-full bg-white/10" />

                        {/* Match Details Grid */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <motion.div variants={itemVariants}>
                                <label htmlFor="venue" className={labelStyle}>Location / Venue</label>
                                <input 
                                    type="text" 
                                    id="venue" 
                                    value={venue} 
                                    onChange={(e) => setVenue(e.target.value)} 
                                    className={inputStyle} 
                                    placeholder="e.g. Sector 7 Stadium"
                                    required 
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="matchDate" className={labelStyle}>Operation Timestamp</label>
                                <input 
                                    type="datetime-local" 
                                    id="matchDate" 
                                    value={matchDate} 
                                    onChange={(e) => setMatchDate(e.target.value)} 
                                    className={`${inputStyle} [color-scheme:dark]`} 
                                />
                            </motion.div>
                        </div>

                        {/* Rules Configuration */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <motion.div variants={itemVariants}>
                                <label htmlFor="overs" className={labelStyle}>Overs Limit</label>
                                <input 
                                    type="number" 
                                    id="overs" 
                                    value={overs} 
                                    onChange={(e) => setOvers(e.target.value)} 
                                    className={inputStyle} 
                                    min="1" 
                                    required 
                                />
                            </motion.div>
                            
                            <motion.div variants={itemVariants}>
                                <label htmlFor="wickets" className={labelStyle}>Wickets Cap</label>
                                <input 
                                    type="number" 
                                    id="wickets" 
                                    value={wickets} 
                                    onChange={(e) => setWickets(e.target.value)} 
                                    className={inputStyle} 
                                    min="1" 
                                    max="10" 
                                    required 
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
                                <label htmlFor="umpire" className={labelStyle}>Match Official (Optional)</label>
                                <div className="relative">
                                    <select id="umpire" value={umpireId} onChange={(e) => setUmpireId(e.target.value)} className={inputStyle}>
                                        <option value="" className={optionStyle}>Auto-Assign / None</option>
                                        {allUsers.map(u => <option key={u.id} value={u.id} className={optionStyle}>{u.username}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Submit Action */}
                        <motion.button 
                            variants={itemVariants}
                            type="submit" 
                            className="btn bg-emerald-500 text-black font-bold w-full py-4 rounded-xl text-lg uppercase tracking-wide transition-all duration-300 hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] mt-8" 
                            disabled={loading}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    INITIALIZING MATCH...
                                </span>
                            ) : (
                                'INITIATE MATCH SEQUENCE'
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default CreateMatchForm;