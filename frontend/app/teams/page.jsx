"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import TeamCard from '../components/team/TeamCard';
import CreateTeamForm from '../components/team/CreateTeamForm';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';

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
        // Add the new team to the top of the list
        setTeams([newTeam, ...teams]);
        setShowCreateForm(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-secondary">All Teams</h1>
                {isAuthenticated && (
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
                        {showCreateForm ? 'Cancel' : 'Create New Team'}
                    </button>
                )}
            </div>

            {showCreateForm && (
                <div className="mb-8 transition-all duration-500">
                    <CreateTeamForm onTeamCreated={handleTeamCreated} />
                </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.length > 0 ? (
                    teams.map(team => <TeamCard key={team.id} team={team} />)
                ) : (
                    <p className="col-span-full text-center text-slate-500">No teams have been created yet.</p>
                )}
            </div>
        </div>
    );
}
