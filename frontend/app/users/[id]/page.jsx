"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Spinner from '../../components/ui/Spinner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

export default function UserProfilePage() {
    const { id: userId } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '' });
    const [editError, setEditError] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${userId}`);
            setProfile(res.data);
            setFormData({ username: res.data.username, email: res.data.email || '' });
        } catch (err) {
            setError('Failed to load user profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [userId, fetchUserProfile]);

    const handleUpdateProfile = async () => {
        setEditError('');
        setEditLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/users/update`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setProfile(prev => ({ ...prev, ...res.data }));
            setIsEditing(false);
        } catch (err) {
            setEditError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    // Styling Constants
    const labelStyle = "block text-emerald-400 text-xs font-mono uppercase tracking-widest mb-2 ml-1";
    const inputStyle = "w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-300 font-bold tracking-wide";

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
    
    if (!profile) return (
        <div className="flex justify-center items-center min-h-screen bg-black text-gray-500 font-mono">
            USER PROFILE NOT FOUND.
        </div>
    );

    const chartData = [
        { name: 'Matches', value: profile.profile.matchesPlayed, color: '#3b82f6' },
        { name: 'Avg', value: parseFloat(profile.profile.battingAverage.toFixed(2)), color: '#10b981' },
        { name: 'S.Rate', value: parseFloat(profile.profile.strikeRate.toFixed(2)), color: '#f59e0b' },
        { name: 'Wickets', value: profile.profile.wicketsTaken, color: '#ef4444' },
    ];

    // Custom Tooltip for Dark Mode
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1a1a1a] text-white p-3 rounded-lg border border-white/10 backdrop-blur-md shadow-xl">
                    <p className="font-mono text-xs text-gray-400 uppercase mb-1">{label}</p>
                    <p className="text-emerald-400 font-bold text-xl">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
             {/* Ambient Background Glows */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div 
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12"
                variants={containerVariants} 
                initial="hidden" 
                animate="visible"
            >
                {/* Header Profile Section */}
                <motion.div variants={itemVariants} className="mb-12 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <svg className="w-32 h-32 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="inline-block relative mb-6">
                            <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-900 flex items-center justify-center text-white font-black text-5xl shadow-[0_0_40px_rgba(16,185,129,0.3)] border-4 border-[#0a0a0a]">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div 
                                    key="edit-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="w-full max-w-md flex flex-col gap-6"
                                >
                                    <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Edit Profile</h2>
                                    <div>
                                        <label className={labelStyle}>Username</label>
                                        <input 
                                            type="text" 
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Email Address</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className={inputStyle}
                                        />
                                    </div>
                                    
                                    {editError && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            {editError}
                                        </div>
                                    )}
                                    
                                    <div className="flex gap-4 justify-center mt-2">
                                        <button 
                                            onClick={handleUpdateProfile} 
                                            disabled={editLoading}
                                            className="px-8 py-3 bg-emerald-500 text-black font-black uppercase tracking-wide rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                                        >
                                            {editLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                setIsEditing(false); 
                                                setFormData({ username: profile.username, email: profile.email || '' }); 
                                                setEditError(''); 
                                            }}
                                            className="px-8 py-3 bg-zinc-800 text-white font-bold uppercase tracking-wide rounded-xl hover:bg-zinc-700 transition-colors border border-white/10"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="display-info"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative group mb-2">
                                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                                            {profile.username}
                                        </h1>
                                        {isOwnProfile && (
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-zinc-500 hover:text-emerald-400 hover:scale-110 p-2"
                                                title="Edit Profile"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-6">{profile.email}</p>
                                    
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        {profile.role}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Career Stats Chart */}
                    <motion.div 
                        variants={itemVariants} 
                        className="md:col-span-2 bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Performance Metrics</h2>
                                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Career Analytics</p>
                            </div>
                        </div>

                        <div style={{ width: '100%', height: 350 }} className="relative z-10">
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#525252" 
                                        tick={{fill: '#a3a3a3', fontSize: 12, fontFamily: 'monospace'}} 
                                        axisLine={false}
                                        tickLine={false}
                                        dy={15}
                                    />
                                    <YAxis 
                                        stroke="#525252" 
                                        tick={{fill: '#a3a3a3', fontSize: 12, fontFamily: 'monospace'}} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Teams List */}
                    <motion.div 
                        variants={itemVariants} 
                        className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col"
                    >
                        <div className="mb-6 relative z-10">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Affiliations</h2>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">Active Squads</p>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            {profile.teamMemberships.length > 0 ? (
                                <ul className="space-y-3">
                                    {profile.teamMemberships.map(membership => (
                                        <motion.li 
                                            key={membership.team.id} 
                                            whileHover={{ x: 5 }}
                                        >
                                            <Link href={`/teams/${membership.team.id}`} className="group flex justify-between items-center p-4 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-800 transition-all duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                                                        {membership.team.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-300 group-hover:text-white transition-colors">
                                                        {membership.team.name}
                                                    </span>
                                                </div>
                                                {membership.role === 'CAPTAIN' && (
                                                    <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold uppercase tracking-wider">
                                                        CPT
                                                    </span>
                                                )}
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-xl p-6">
                                    <p className="text-gray-500 font-mono text-sm uppercase">Free Agent</p>
                                    <p className="text-xs text-gray-600 mt-1">No active team data found.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}