"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const CreateMatchForm = () => {
    const [venue, setVenue] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [userTeams, setUserTeams] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    // Fetch the teams the current user is a captain of, and all other teams
    useEffect(() => {
        const fetchTeamsData = async () => {
            if (!user) return;
            try {
                // Fetch all teams
                const allTeamsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
                setAllTeams(allTeamsRes.data);

                // Fetch user's profile to find teams they captain
                const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${user.id}`);
                const captainOfTeams = profileRes.data.teamMemberships
                    .filter(m => m.role === 'CAPTAIN')
                    .map(m => m.team);
                setUserTeams(captainOfTeams);
                
                // Set default home team if they captain only one team
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
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/matches`,
                { venue, matchDate, homeTeamId, awayTeamId }
            );
            router.push(`/matches/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create match.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-secondary mb-6">Host a New Match</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="homeTeam" className="block text-slate-700 mb-2 font-semibold">Your Team (Home)</label>
                    <select id="homeTeam" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)} className="input-field" required>
                        <option value="">Select your team</option>
                        {userTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="awayTeam" className="block text-slate-700 mb-2 font-semibold">Opponent (Away)</label>
                    <select id="awayTeam" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)} className="input-field" required>
                        <option value="">Select opponent</option>
                        {allTeams.filter(t => t.id !== homeTeamId).map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="venue" className="block text-slate-700 mb-2 font-semibold">Venue</label>
                    <input type="text" id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="input-field" required />
                </div>
                <div>
                    <label htmlFor="matchDate" className="block text-slate-700 mb-2 font-semibold">Date and Time</label>
                    <input type="datetime-local" id="matchDate" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="input-field" />
                </div>
                <button type="submit" className="btn btn-primary w-full !mt-6" disabled={loading}>
                    {loading ? 'Creating Match...' : 'Create Match'}
                </button>
            </form>
        </div>
    );
};

export default CreateMatchForm;
