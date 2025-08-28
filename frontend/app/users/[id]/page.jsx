"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Spinner from '../../components/ui/Spinner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    if (loading) return <div className="flex justify-center mt-16"><Spinner /></div>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!profile) return <p className="text-center">User not found.</p>;

    const chartData = [
        { name: 'Matches', value: profile.profile.matchesPlayed },
        { name: 'Batting Avg', value: parseFloat(profile.profile.battingAverage.toFixed(2)) },
        { name: 'Strike Rate', value: parseFloat(profile.profile.strikeRate.toFixed(2)) },
        { name: 'Wickets', value: profile.profile.wicketsTaken },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="text-4xl font-bold text-black">{profile.username}</h1>
                <p className="text-slate-600 mt-1">{profile.email}</p>
                <span className="mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    {profile.role}
                </span>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="md:col-span-2 card bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-2xl font-bold text-black mb-4">Career Statistics</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" />
                                <YAxis stroke="#475569" />
                                <Tooltip cursor={{fill: 'rgba(16, 185, 129, 0.1)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                                <Bar dataKey="value" fill="#10b981" barSize={40} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                    <h2 className="text-2xl font-bold text-black mb-4">Teams</h2>
                    {profile.teamMemberships.length > 0 ? (
                        <ul className="space-y-3">
                            {profile.teamMemberships.map(membership => (
                                <motion.li 
                                    key={membership.team.id} 
                                    className="p-3 bg-slate-50 rounded-lg hover:bg-emerald-50 transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                >
                                    <Link href={`/teams/${membership.team.id}`} className="flex justify-between items-center">
                                        <span className="font-semibold text-emerald-600 hover:underline">{membership.team.name}</span>
                                        {membership.role === 'CAPTAIN' && <span className="text-xs px-2 py-1 rounded-full bg-amber-200 text-amber-800 font-bold">(Captain)</span>}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">This player is not yet part of any team.</p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
