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
        return <div className="flex justify-center items-center h-[80vh]"><Spinner /></div>;
    }

    const chartData = [
        { name: 'Matches', value: profile.profile.matchesPlayed, color: '#3b82f6' }, // Blue
        { name: 'Avg', value: parseFloat(profile.profile.battingAverage.toFixed(2)), color: '#10b981' }, // Emerald
        { name: 'SR', value: parseFloat(profile.profile.strikeRate.toFixed(2)), color: '#f59e0b' }, // Amber
        { name: 'Wickets', value: profile.profile.wicketsTaken, color: '#ef4444' }, // Red
    ];

    // Custom Tooltip for the Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl border border-slate-700">
                    <p className="font-bold text-sm mb-1">{label}</p>
                    <p className="text-emerald-400 font-mono text-lg">{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div 
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
        >
            {/* Header Section */}
            <motion.div 
                variants={itemVariants} 
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6"
            >
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-100 tracking-tight">
                        Dashboard
                    </h1>
                    <div className="flex items-center mt-2 space-x-2">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-lg text-red-400 font-medium">
                            Welcome back, <span className="text-white font-bold">{profile.username}</span>
                        </p>
                    </div>
                </div>
                
                {isCaptain && (
                    <Link href="/matches/create" legacyBehavior>
                        <motion.a 
                            className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-emerald-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 hover:bg-emerald-500 shadow-lg hover:shadow-emerald-300/50 cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="mr-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </span>
                            Host New Match
                        </motion.a>
                    </Link>
                )}
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Career Statistics Chart */}
                <motion.div 
                    variants={itemVariants} 
                    className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow duration-300"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Performance</h3>
                            <p className="text-sm text-slate-400">Career metrics overview</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#64748b" 
                                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    tick={{fill: '#64748b', fontSize: 12}} 
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Teams Section */}
                <motion.div 
                    variants={itemVariants} 
                    className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Your Squads</h3>
                            <p className="text-sm text-slate-400">Teams you are part of</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {profile.teamMemberships.length > 0 ? (
                            profile.teamMemberships.map(membership => (
                                <Link key={membership.team.id} href={`/teams/${membership.team.id}`} legacyBehavior>
                                    <motion.a 
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300"
                                        whileHover={{ scale: 1.02, x: 5 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {membership.team.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{membership.team.name}</p>
                                                <p className="text-xs text-slate-500">Member</p>
                                            </div>
                                        </div>
                                        {membership.role === 'CAPTAIN' && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200 shadow-sm">
                                                CPT
                                            </span>
                                        )}
                                    </motion.a>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                </div>
                                <p className="text-slate-500">You haven't joined any teams yet.</p>
                            </div>
                        )}
                    </div>

                    <Link href="/teams" legacyBehavior>
                        <motion.a 
                            className="mt-6 w-full block text-center py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Browse All Teams
                        </motion.a>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}