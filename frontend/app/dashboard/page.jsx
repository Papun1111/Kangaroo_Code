"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Spinner from '../components/ui/Spinner';
import { motion } from 'framer-motion';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell 
} from 'recharts';

export default function DashboardPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                try {
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${user.id}`);
                    setProfile(res.data);
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!authLoading && isAuthenticated) {
            fetchProfile();
        }
    }, [user, authLoading, isAuthenticated]);

    const isCaptain = profile?.role === 'CAPTAIN';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.15,
                delayChildren: 0.2
            } 
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
        },
    };

    if (authLoading || loading || !profile) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <Spinner />
            </div>
        );
    }

    const chartData = [
        { name: 'Matches', value: profile.profile.matchesPlayed, color: '#3b82f6' }, // Blue
        { name: 'Avg', value: parseFloat(profile.profile.battingAverage.toFixed(2)), color: '#10b981' }, // Emerald
        { name: 'SR', value: parseFloat(profile.profile.strikeRate.toFixed(2)), color: '#f59e0b' }, // Amber
        { name: 'Wickets', value: profile.profile.wicketsTaken, color: '#ef4444' }, // Red
    ];

    // Custom Tooltip for the Chart - Dark Theme
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 text-white p-4 rounded-xl border border-white/20 backdrop-blur-md shadow-2xl">
                    <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-emerald-400 font-black text-2xl">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <motion.div 
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10"
                variants={containerVariants} 
                initial="hidden" 
                animate="visible"
            >
                {/* Header Section */}
                <motion.div 
                    variants={itemVariants} 
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-white/10 pb-8"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                             <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">System Online</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            Player<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Dashboard</span>
                        </h1>
                        <p className="text-gray-400 mt-4 text-lg font-light">
                            Welcome back agent, <span className="text-emerald-400 font-bold">{profile.username}</span>
                        </p>
                    </div>
                    
                    {isCaptain && (
                        <Link href="/matches/create">
                            <motion.div 
                                className="group relative overflow-hidden rounded-full bg-emerald-500 px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center gap-2 uppercase tracking-wide text-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                                    Initialize Match
                                </span>
                            </motion.div>
                        </Link>
                    )}
                </motion.div>
                
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Career Statistics Chart */}
                    <motion.div 
                        variants={itemVariants} 
                        className="lg:col-span-2 bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 md:p-10 hover:border-emerald-500/30 transition-colors duration-500 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-32 h-32 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3v18h18v-2H5V3H3zm4 14h2v-5H7v5zm4 0h2v-9h-2v9zm4 0h2v-3h-2v3zm4 0h2v-7h-2v7z"/></svg>
                        </div>

                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2">Performance Metrics</h3>
                                <p className="text-sm font-mono text-emerald-500 uppercase tracking-widest">Career Analytics Overview</p>
                            </div>
                        </div>
                        
                        <div style={{ width: '100%', height: 350 }} className="relative z-10">
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#525252" 
                                        tick={{fill: '#a3a3a3', fontSize: 12, fontWeight: 600, fontFamily: 'monospace'}} 
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
                                    <Tooltip 
                                        content={<CustomTooltip />} 
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color} 
                                                className="opacity-80 hover:opacity-100 transition-opacity duration-300"
                                                strokeWidth={0}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Teams Section */}
                    <motion.div 
                        variants={itemVariants} 
                        className="bg-[#0a0a0a] rounded-[2rem] border border-white/10 p-8 md:p-10 flex flex-col h-full hover:border-emerald-500/30 transition-colors duration-500"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2">Squad List</h3>
                                <p className="text-sm font-mono text-emerald-500 uppercase tracking-widest">Active Deployments</p>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {profile.teamMemberships.length > 0 ? (
                                profile.teamMemberships.map(membership => (
                                    <Link key={membership.team.id} href={`/teams/${membership.team.id}`}>
                                        <motion.div
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer group hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300"
                                            whileHover={{ x: 5 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-shadow">
                                                    {membership.team.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{membership.team.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono uppercase">Status: Active</p>
                                                </div>
                                            </div>
                                            {membership.role === 'CAPTAIN' && (
                                                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold font-mono tracking-widest uppercase rounded border border-amber-500/20">
                                                    CPT
                                                </span>
                                            )}
                                        </motion.div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center justify-center h-full border-2 border-dashed border-white/5 rounded-xl">
                                    <div className="bg-white/5 p-4 rounded-full mb-4">
                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                    </div>
                                    <p className="text-gray-500 font-mono text-sm">NO ACTIVE SQUADS FOUND</p>
                                </div>
                            )}
                        </div>

                        <Link href="/teams">
                            <motion.div
                                className="mt-8 w-full block text-center py-4 rounded-xl border border-white/20 text-white font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                                whileTap={{ scale: 0.98 }}
                            >
                                Access Global Registry
                            </motion.div>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}