"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CreateTeamForm = ({ onTeamCreated }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/teams`,
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onTeamCreated(res.data);
            router.push(`/teams/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Create a New Team</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="teamName" className="block text-slate-700 mb-2">Team Name</label>
                    <input
                        type="text"
                        id="teamName"
                        className="input-field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., The Champions"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Team'}
                </button>
            </form>
        </div>
    );
};

export default CreateTeamForm;
