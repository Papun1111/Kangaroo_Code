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

    if (loading) return <div className="flex justify-center mt-16"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!team) return <p className="text-center mt-8">Team not found.</p>;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h1 variants={itemVariants} className="text-4xl font-bold text-[#E4EFE7] mb-6">{team.name}</motion.h1>
            
            <div className="grid md:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <div className="card bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Player Roster</h2>
                        {team.members.length > 0 ? (
                            <ul className="space-y-3">
                                {team.members.map(member => (
                                    <motion.li 
                                        key={member.id} 
                                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-emerald-50 transition-colors"
                                        whileHover={{ scale: 1.03 }}
                                    >
                                        <Link href={`/users/${member.userId}`} className="font-semibold text-emerald-600 hover:underline">
                                            {member.user.username}
                                        </Link>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${member.role === 'CAPTAIN' ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {member.role}
                                        </span>
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                           <p>This team has no players yet.</p>
                        )}
                    </div>
                </motion.div>
                
                {isAuthenticated && isCaptain && (
                    <motion.div variants={itemVariants} className="card bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-fit">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Team</h2>
                        <form onSubmit={handleAddPlayer}>
                            <h3 className="font-semibold mb-2 text-gray-800">Add New Player</h3>
                            {addPlayerError && <p className="text-sm text-red-500 mb-2">{addPlayerError}</p>}
                            <select 
                                value={selectedPlayer}
                                onChange={(e) => setSelectedPlayer(e.target.value)}
                                className="text-[#273F4F] input-field mb-4 transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">Select a player to invite</option>
                                {allUsers
                                    .filter(u => !team.members.some(m => m.userId === u.id))
                                    .map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                            <motion.button 
                                type="submit" 
                                className="btn bg-emerald-500 text-white w-full py-2"
                                whileTap={{ scale: 0.98 }}
                            >
                                Add Player
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
