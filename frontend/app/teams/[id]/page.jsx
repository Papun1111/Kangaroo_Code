"use client";

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TeamDetailPage() {
    const { id: teamId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [allUsers, setAllUsers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [addPlayerError, setAddPlayerError] = useState('');

    const isCaptain = team?.members.some(m => m.userId === user?.id && m.role === 'CAPTAIN');

    const fetchTeamData = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}`);
            setTeam(res.data);
        } catch (err) {
            setError('Failed to fetch team details. The team may not exist.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [teamId]);
    
    const fetchAllUsers = useCallback(async () => {
        if (isCaptain) {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`);
                setAllUsers(res.data);
            } catch (error) {
                console.error("Could not fetch users for team management", error);
            }
        }
    }, [isCaptain]);

    useEffect(() => {
        if (teamId) {
            fetchTeamData();
        }
    }, [teamId, fetchTeamData]);

    useEffect(() => {
        if (team && isCaptain) {
            fetchAllUsers();
        }
    }, [team, isCaptain, fetchAllUsers]);

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        setAddPlayerError('');
        if (!selectedPlayer) {
            setAddPlayerError('Please select a player to add.');
            return;
        }
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}/players`, { userId: selectedPlayer });
            fetchTeamData();
            setSelectedPlayer('');
        } catch (err) {
            setAddPlayerError(err.response?.data?.message || 'Failed to add player.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-black">
            <Spinner />
        </div>
    );
    
    if (error) return (
        <div className="flex justify-center items-center min-h-screen bg-black text-red-500 font-mono">
            {error}
        </div>
    );
    
    if (!team) return (
        <div className="flex justify-center items-center min-h-screen bg-black text-gray-500 font-mono">
            TEAM ENTITY NOT FOUND.
        </div>
    );

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
             {/* Ambient Background Glows */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12"
                variants={containerVariants} 
                initial="hidden" 
                animate="visible"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="mb-10 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Team Profile</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
                        {team.name}
                    </h1>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Roster */}
                    <motion.div variants={itemVariants} className="md:col-span-2">
                        <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
                            {/* Decorative Grid Background */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                            
                            <div className="p-8 relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    Active Roster
                                </h2>
                                
                                {team.members.length > 0 ? (
                                    <ul className="space-y-4">
                                        {team.members.map(member => (
                                            <motion.li 
                                                key={member.id} 
                                                className="group flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-300"
                                                whileHover={{ x: 5 }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                                        {member.user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <Link href={`/users/${member.userId}`} className="font-bold text-lg text-gray-200 hover:text-emerald-400 transition-colors">
                                                        {member.user.username}
                                                    </Link>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {member.role === 'CAPTAIN' ? (
                                                        <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                                                            Captain
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/5 text-gray-500 border border-white/10 rounded-full">
                                                            Agent
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                                        <p className="text-gray-500 font-mono text-sm uppercase">No operatives assigned.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Right Column: Management (Only for Captain) */}
                    {isAuthenticated && isCaptain && (
                        <motion.div variants={itemVariants} className="md:col-span-1">
                            <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden h-fit">
                                <div className="relative z-10">
                                    <h2 className="text-xl font-bold text-white mb-1">Command Center</h2>
                                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-6">Manage Unit Composition</p>
                                    
                                    <form onSubmit={handleAddPlayer} className="space-y-4">
                                        {addPlayerError && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs mb-4">
                                                {addPlayerError}
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label className="block text-emerald-500 text-xs font-mono uppercase tracking-widest mb-2 ml-1">
                                                Select Operative
                                            </label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedPlayer}
                                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300"
                                                >
                                                    <option value="" className="bg-[#1a1a1a]">Select personnel...</option>
                                                    {allUsers
                                                        .filter(u => !team.members.some(m => m.userId === u.id))
                                                        .map(u => (
                                                        <option key={u.id} value={u.id} className="bg-[#1a1a1a] text-gray-200">
                                                            {u.username}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <motion.button 
                                            type="submit" 
                                            className="w-full btn bg-emerald-500 text-black font-bold py-3 rounded-xl uppercase tracking-wide text-sm hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Authorize Recruitment
                                        </motion.button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}