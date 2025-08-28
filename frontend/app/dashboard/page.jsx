"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Spinner from '../components/ui/Spinner';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    if (authLoading || loading || !profile) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    const chartData = [
        { name: 'Matches', value: profile.profile.matchesPlayed },
        { name: 'Avg', value: parseFloat(profile.profile.battingAverage.toFixed(2)) },
        { name: 'SR', value: parseFloat(profile.profile.strikeRate.toFixed(2)) },
        { name: 'Wickets', value: profile.profile.wicketsTaken },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-secondary">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {profile.username}!</p>
                </div>
                {isCaptain && (
                    <Link href="/matches/create" className="btn bg-emerald-500 text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
                        Host New Match
                    </Link>
                )}
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 card bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                    <h3 className="text-gray-800 text-2xl font-bold mb-4 text-secondary">Career Statistics</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip cursor={{fill: 'rgba(22, 163, 74, 0.1)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                                <Bar dataKey="value" fill="#10b981" barSize={40} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                    <h3 className=" text-gray-800 text-2xl font-bold mb-4 text-secondary">Your Teams</h3>
                    {profile.teamMemberships.length > 0 ? (
                        <ul className="space-y-3">
                            {profile.teamMemberships.map(membership => (
                                <motion.li 
                                    key={membership.team.id} 
                                    className="p-3 bg-slate-50 rounded-lg hover:bg-emerald-50 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Link href={`/teams/${membership.team.id}`} className="flex justify-between items-center">
                                        <span className="text-emerald-600 hover:underline font-semibold">{membership.team.name}</span>
                                        {membership.role === 'CAPTAIN' && <span className="text-xs px-2 py-1 rounded-full bg-amber-200 text-amber-800 font-bold">(Captain)</span>}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <p>You are not a member of any team yet.</p>
                    )}
                     <Link href="/teams" className="btn btn-secondary mt-6 inline-block w-full text-center">
                        Browse Teams
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}
