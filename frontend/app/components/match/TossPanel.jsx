"use client";

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TossPanel = ({ match, onTossUpdate }) => {
    const [tossWinnerId, setTossWinnerId] = useState('');
    const [decision, setDecision] = useState('bat');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tossWinnerId) {
            setError('Please select the team that won the toss.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/matches/${match.id}/toss`,
                { tossWinnerId, decision }
            );
            onTossUpdate(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit toss result.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="card max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="text-2xl font-bold text-center text-black mb-6">Toss Result</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-black mb-2 font-semibold">Who won the toss?</label>
                    <select value={tossWinnerId} onChange={(e) => setTossWinnerId(e.target.value)} className="input-field text-[#111111]" required>
                        <option value="">Select Team</option>
                        <option value={match.homeTeam.id}>{match.homeTeam.name}</option>
                        <option value={match.awayTeam.id}>{match.awayTeam.name}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-black mb-2 font-semibold">Decision</label>
                    <select value={decision} onChange={(e) => setDecision(e.target.value)} className="input-field text-[#111111]">
                        <option value="bat">Bat</option>
                        <option value="field">Field</option>
                    </select>
                </div>
                <motion.button 
                    type="submit" 
                    className="btn bg-emerald-500 text-white w-full !mt-6 py-3 text-lg font-bold" 
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? 'Starting Match...' : 'Start Match'}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default TossPanel;
