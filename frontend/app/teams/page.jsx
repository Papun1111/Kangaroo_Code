"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import TeamCard from '../components/team/TeamCard';
import CreateTeamForm from '../components/team/CreateTeamForm';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { isAuthenticated } = useAuth();

    const fetchTeams = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
            setTeams(res.data);
        } catch (error) {
            console.error("Failed to fetch teams", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleTeamCreated = (newTeam) => {
        setTeams([newTeam, ...teams]);
        setShowCreateForm(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div 
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="text-4xl font-bold text-secondary">All Teams</h1>
                    <p className="text-slate-500 mt-1">Browse teams or create your own to start competing.</p>
                </div>
                {isAuthenticated && (
                    <button 
                        onClick={() => setShowCreateForm(!showCreateForm)} 
                        className="btn bg-emerald-500 text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
                    >
                        {showCreateForm ? 'Cancel' : 'Create New Team'}
                    </button>
                )}
            </motion.div>

            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                        <CreateTeamForm onTeamCreated={handleTeamCreated} />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
            >
                {teams.length > 0 ? (
                    teams.map(team => <TeamCard key={team.id} team={team} />)
                ) : (
                    <p className="col-span-full text-center text-slate-500 mt-8">No teams have been created yet.</p>
                )}
            </motion.div>
        </motion.div>
    );
}
