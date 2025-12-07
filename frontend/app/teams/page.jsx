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
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            } 
        },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-black">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Content Container - Added pt-28 to prevent Navbar overlap */}
            <motion.div 
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12"
                initial="hidden" 
                animate="visible" 
                variants={containerVariants}
            >
                {/* Header Section */}
                <motion.div 
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-white/10 pb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                             <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Global Registry</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                            All<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Teams</span>
                        </h1>
                        <p className="text-gray-400 mt-4 max-w-lg font-light">
                            Browse the roster of competing squads or register your own entity to join the league.
                        </p>
                    </div>

                    {isAuthenticated && (
                        <motion.button 
                            onClick={() => setShowCreateForm(!showCreateForm)} 
                            className={`group relative px-8 py-3 rounded-full font-bold uppercase tracking-wide text-sm transition-all duration-300 ${
                                showCreateForm 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' 
                                : 'bg-emerald-500 text-black hover:bg-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {showCreateForm ? 'Cancel Operation' : 'Register New Team'}
                        </motion.button>
                    )}
                </motion.div>

                {/* Create Team Form Collapse */}
                <AnimatePresence>
                    {showCreateForm && (
                        <motion.div
                            className="mb-12 overflow-hidden"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                            <div className="bg-[#0a0a0a] border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
                                <CreateTeamForm onTeamCreated={handleTeamCreated} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Teams Grid */}
                <motion.div 
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                >
                    {teams.length > 0 ? (
                        teams.map(team => (
                            <motion.div 
                                key={team.id}
                                variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: { y: 0, opacity: 1 }
                                }}
                            >
                                <TeamCard team={team} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5"
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                            <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">No active squads found in registry.</p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}