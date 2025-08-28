"use client";

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import Link from 'next/link';

export default function TeamDetailPage() {
    const { id: teamId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for adding players
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
            // Refetch team data to show the new player
            fetchTeamData();
            setSelectedPlayer('');
        } catch (err) {
            setAddPlayerError(err.response?.data?.message || 'Failed to add player.');
        }
    };

    if (loading) return <div className="flex justify-center mt-16"><Spinner /></div>;
    if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
    if (!team) return <p className="text-center mt-8">Team not found.</p>;

    return (
        <div>
            <h1 className="text-4xl font-bold text-secondary mb-4">{team.name}</h1>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4">Player Roster</h2>
                        {team.members.length > 0 ? (
                            <ul className="space-y-3">
                                {team.members.map(member => (
                                    <li key={member.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                                        <Link href={`/users/${member.userId}`} className="font-semibold text-primary hover:underline">
                                            {member.user.username}
                                        </Link>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${member.role === 'CAPTAIN' ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {member.role}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                           <p>This team has no players yet.</p>
                        )}
                    </div>
                </div>
                
                {isAuthenticated && isCaptain && (
                    <div className="card h-fit">
                        <h2 className="text-2xl font-bold mb-4">Manage Team</h2>
                        <form onSubmit={handleAddPlayer}>
                            <h3 className="font-semibold mb-2">Add New Player</h3>
                            {addPlayerError && <p className="text-sm text-red-500 mb-2">{addPlayerError}</p>}
                            <select 
                                value={selectedPlayer}
                                onChange={(e) => setSelectedPlayer(e.target.value)}
                                className="input-field mb-4"
                            >
                                <option value="">Select a player to invite</option>
                                {allUsers
                                    .filter(u => !team.members.some(m => m.userId === u.id)) // Filter out existing members
                                    .map(u => (
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-primary w-full">Add Player</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
