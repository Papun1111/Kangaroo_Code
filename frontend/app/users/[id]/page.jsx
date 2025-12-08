"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Spinner from '../../components/ui/Spinner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function UserProfilePage() {
    const { id: userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${userId}`);
            setProfile(res.data);
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
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
                <div className="bg-black/90 text-white p-3 rounded-lg border border-white/20 backdrop-blur-md shadow-xl">
                    <p className="font-mono text-xs text-gray-400 uppercase mb-1">{label}</p>
                    <p className="text-emerald-400 font-bold text-xl">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

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
                <motion.div variants={itemVariants} className="text-center mb-12">
                    <div className="inline-block relative">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center text-white font-black text-4xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-6 border-4 border-black">
                            {profile.username.charAt(0).toUpperCase()}
                        </div>
                        {/* Status Dot */}
                        <div className="absolute bottom-6 right-0 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"></div>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                        {profile.username}
                    </h1>
                    <p className="text-gray-500 font-mono text-sm tracking-widest uppercase mb-4">{profile.email}</p>
                    
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest">
                        {profile.role}
                    </span>
                </motion.div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Career Stats Chart */}
                    <motion.div 
                        variants={itemVariants} 
                        className="md:col-span-2 bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Performance Metrics</h2>
                                <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Career Analytics</p>
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
                        className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 shadow-2xl flex flex-col h-full"
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white">Affiliations</h2>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Active Squads</p>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                            {profile.teamMemberships.length > 0 ? (
                                <ul className="space-y-3">
                                    {profile.teamMemberships.map(membership => (
                                        <motion.li 
                                            key={membership.team.id} 
                                            className="group"
                                            whileHover={{ x: 5 }}
                                        >
                                            <Link 
                                                href={`/teams/${membership.team.id}`} 
                                                className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                                                        {membership.team.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-200 group-hover:text-white transition-colors">
                                                        {membership.team.name}
                                                    </span>
                                                </div>
                                                
                                                {membership.role === 'CAPTAIN' && (
                                                    <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-bold uppercase tracking-wider">
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