"use client";

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Spinner from '@/app/components/ui/Spinner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamDetailPage() {
    const { id: teamId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [allUsers, setAllUsers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [addPlayerError, setAddPlayerError] = useState('');
    
    // Logo Upload State
    const [uploading, setUploading] = useState(false);

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
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}/players`, 
                { userId: selectedPlayer },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTeamData();
            setSelectedPlayer('');
        } catch (err) {
            setAddPlayerError(err.response?.data?.message || 'Failed to add player.');
        }
    };

    const handleRemovePlayer = async (playerId) => {
        if (!confirm("Are you sure you want to remove this player from the roster?")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}/players/${playerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTeamData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove player.');
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("File size too large. Please upload an image smaller than 2MB.");
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = reader.result;
                const token = localStorage.getItem('token');
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}/logo`, 
                    { logoUrl: base64String },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchTeamData(); 
            } catch (err) {
                console.error("Logo upload failed", err);
                alert("Failed to upload logo.");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    // Styling
    const labelStyle = "block text-emerald-500 text-xs font-mono uppercase tracking-widest mb-2 ml-1";
    const inputStyle = "w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-all placeholder-zinc-500";

    if (loading) return <div className="flex justify-center h-screen items-center bg-black"><Spinner /></div>;
    if (error) return <div className="flex justify-center h-screen items-center bg-black text-red-500 font-mono">{error}</div>;
    if (!team) return <div className="flex justify-center h-screen items-center bg-black text-zinc-500 font-mono">TEAM NOT FOUND</div>;

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
             {/* Ambient Background Glows */}
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12"
                variants={containerVariants} 
                initial="hidden" 
                animate="visible"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="mb-10 flex flex-col md:flex-row items-center gap-8 border-b border-white/10 pb-10">
                    
                    {/* Logo with Upload Overlay */}
                    <div className="relative group flex-shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#0a0a0a] border-4 border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            {team.logoUrl ? (
                                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-5xl md:text-6xl font-black text-emerald-500/50">{team.name.charAt(0)}</span>
                            )}
                        </div>
                        
                        {isCaptain && (
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer backdrop-blur-sm">
                                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                    <svg className="w-8 h-8 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">{uploading ? 'Uploading...' : 'Change Logo'}</span>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                            <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Active Squad</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-2">
                            {team.name}
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
                            Total Operatives: <span className="text-white">{team.members.length}</span>
                        </p>
                    </div>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Roster */}
                    <motion.div variants={itemVariants} className="md:col-span-2">
                        <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative p-8">
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    Team Roster
                                </h2>
                            </div>
                            
                            {team.members.length > 0 ? (
                                <ul className="space-y-3">
                                    {team.members.map(member => (
                                        <motion.li 
                                            key={member.id} 
                                            className="group flex justify-between items-center p-4 bg-zinc-900/40 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all duration-300"
                                            whileHover={{ x: 5 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-white font-bold border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                                    {member.user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <Link href={`/users/${member.userId}`} className="block font-bold text-lg text-gray-200 hover:text-emerald-400 transition-colors">
                                                        {member.user.username}
                                                    </Link>
                                                    {member.role === 'CAPTAIN' && (
                                                        <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider">Unit Commander</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {member.role === 'CAPTAIN' ? (
                                                    <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                                                        CPT
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-white/5 text-gray-500 border border-white/10 rounded-full">
                                                            MBR
                                                        </span>
                                                        {/* Remove Button for Captains */}
                                                        {isCaptain && (
                                                            <button 
                                                                onClick={() => handleRemovePlayer(member.userId)}
                                                                className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                                                title="Remove from Team"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
                                    <p className="text-zinc-500 font-mono text-sm uppercase">No operatives assigned.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                    
                    {/* Right Column: Management (Only for Captain) */}
                    {isAuthenticated && isCaptain && (
                        <motion.div variants={itemVariants} className="md:col-span-1">
                            <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden h-fit sticky top-28">
                                <div className="relative z-10">
                                    <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                        Recruit Player
                                    </h2>
                                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-6">Expand Unit Composition</p>
                                    
                                    <form onSubmit={handleAddPlayer} className="space-y-4">
                                        {addPlayerError && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                {addPlayerError}
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label className={labelStyle}>
                                                Select Operative
                                            </label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedPlayer}
                                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                                    className={inputStyle}
                                                >
                                                    <option value="" className="bg-black">Choose from database...</option>
                                                    {allUsers
                                                        .filter(u => !team.members.some(m => m.userId === u.id))
                                                        .map(u => (
                                                        <option key={u.id} value={u.id} className="bg-black text-gray-300 hover:bg-emerald-900">{u.username}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            type="submit" 
                                            className="btn bg-emerald-600 text-white font-bold w-full py-3.5 rounded-xl uppercase tracking-wide hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group"
                                        >
                                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                            Send Invite
                                        </button>
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