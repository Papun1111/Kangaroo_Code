"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const CreateMatchForm = () => {
    const [venue, setVenue] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [overs, setOvers] = useState('20'); // State for overs
    const [wickets, setWickets] = useState('10'); // State for wickets
    const [userTeams, setUserTeams] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchTeamsData = async () => {
            if (!user) return;
            try {
                const allTeamsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
                setAllTeams(allTeamsRes.data);

                const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${user.id}`);
                const captainOfTeams = profileRes.data.teamMemberships
                    .filter(m => m.role === 'CAPTAIN')
                    .map(m => m.team);
                setUserTeams(captainOfTeams);
                
                if (captainOfTeams.length === 1) {
                    setHomeTeamId(captainOfTeams[0].id);
                }

            } catch (err) {
                setError('Could not load team data.');
            }
        };
        fetchTeamsData();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (homeTeamId === awayTeamId) {
            setError('Home and Away teams cannot be the same.');
            return;
        }
        setLoading(true);
        try {
            // Construct the match data with a 'rules' object
            const matchData = {
                venue,
                matchDate,
                homeTeamId,
                awayTeamId,
                rules: {
                    overs: parseInt(overs, 10),
                    wickets: parseInt(wickets, 10)
                }
            };
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/matches`,
                matchData
            );
            router.push(`/matches/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create match.');
        } finally {
            setLoading(false);
        }
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div 
            className="card max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-200"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center text-black mb-6">Host a New Match</motion.h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants}>
                    <label htmlFor="homeTeam" className="block text-black mb-2 font-semibold">Your Team (Home)</label>
                    <select id="homeTeam" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" required>
                        <option value="">Select your team</option>
                        {userTeams.map(team => <option key={team.id} value={team.id} className="text-[#111111]">{team.name}</option>)}
                    </select>
                </motion.div>
                 <motion.div variants={itemVariants}>
                    <label htmlFor="awayTeam" className="block text-black mb-2 font-semibold">Opponent (Away)</label>
                    <select id="awayTeam" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" required>
                        <option value="">Select opponent</option>
                        {allTeams.filter(t => t.id !== homeTeamId).map(team => <option key={team.id} value={team.id} className="text-[#111111]">{team.name}</option>)}
                    </select>
                </motion.div>
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="overs" className="block text-black mb-2 font-semibold">Overs per Innings</label>
                        <input type="number" id="overs" value={overs} onChange={(e) => setOvers(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div>
                        <label htmlFor="wickets" className="block text-black mb-2 font-semibold">Wickets per Team</label>
                        <input type="number" id="wickets" value={wickets} onChange={(e) => setWickets(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <label htmlFor="venue" className="block text-black mb-2 font-semibold">Venue</label>
                    <input type="text" id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" required />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <label htmlFor="matchDate" className="block text-black mb-2 font-semibold">Date and Time</label>
                    <input type="datetime-local" id="matchDate" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="input-field text-[#111111] transition-all duration-300 focus:border-emerald-500 focus:ring-emerald-500" />
                </motion.div>
                <motion.button 
                    variants={itemVariants}
                    type="submit" 
                    className="btn bg-emerald-500 text-white w-full !mt-6 py-3 text-lg font-bold transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-1" 
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? 'Creating Match...' : 'Create Match'}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default CreateMatchForm;
